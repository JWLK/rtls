import React, { useEffect, useState, useRef } from 'react'

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { MapTheme_DarkGreen } from '../themes/google-map/map-dark-green'
import { MapTheme_DarkGray } from '../themes/google-map/map-dark-gray'
// import { InfoWindow } from '@react-google-maps/api'; // 현재 InfoWindow는 주석 처리 되어 있음

import io from 'socket.io-client'

const containerStyle = {
    width: '100vw',
    height: '85vh',
}

const initialCenter = {
    lat: 37.57972779165909,
    lng: 126.97704086507996,

    //37.57972779165909, 126.97704086507996
}

const customStyles = MapTheme_DarkGray

export function GoogleMapsWrapper({ children, isSharingEnabled, isCentered }) {
    const [permissionStatus, setPermissionStatus] = useState(null) // 위치 권한 상태 저장
    const [socket, setSocket] = useState(null)

    const [markerData, setMarkerData] = useState([])
    const [mapCenter, setMapCenter] = useState(initialCenter)
    const hasCenterBeenSetRef = useRef(false)
    const ownHashCode = useRef(null)

    //Location View
    const [prevPosition, setPrevPosition] = useState(null)
    function calculateBearing(startLat, startLng, destLat, destLng) {
        const y = Math.sin(destLng - startLng) * Math.cos(destLat)
        const x =
            Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) *
                Math.cos(destLat) *
                Math.cos(destLng - startLng)
        let brng = Math.atan2(y, x) * (180 / Math.PI)
        brng = (brng + 360) % 360
        return brng
    }

    const SOCKET_SERVER_URL =
        process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000'

    useEffect(() => {
        // 위치 권한 체크
        if ('permissions' in navigator) {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then((result) => {
                    if (result.state === 'denied') {
                        alert('앱을 사용하려면 위치 권한이 필요합니다.')
                    } else if (result.state === 'prompt') {
                        // 위치 권한을 요청
                        requestLocationPermission()
                    }

                    // 권한 상태가 변경될 때마다 체크
                    result.onchange = function () {
                        if (this.state === 'denied') {
                            alert('앱을 사용하려면 위치 권한이 필요합니다.')
                        }
                    }
                })
        }

        // 위치 권한 요청 함수
        function requestLocationPermission() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // 권한이 승인됐을 때의 로직
                    },
                    (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            alert('위치 권한이 거부되었습니다.')
                        }
                    },
                )
            }
        }
    }, [])

    useEffect(() => {
        // 위치 권한 거부 처리
        if (permissionStatus === 'denied') {
            alert(
                '위치 서비스에 권한을 거부하였습니다. 설정에서 권한을 활성화 해주세요.',
            )
            return
        }

        if (!isSharingEnabled) {
            if (socket) {
                socket.disconnect()
            }
            return
        }

        const socketInstance = io(SOCKET_SERVER_URL)

        socketInstance.on('connect', () => {
            console.log('Connected to the server')
        })

        socketInstance.on('connect_error', (error) => {
            console.error('Connection error:', error)
        })

        socketInstance.on('client-hash', (hash) => {
            console.log('hash', hash)
            ownHashCode.current = hash
        })

        setSocket(socketInstance)

        return () => {
            if (socketInstance) {
                socketInstance.disconnect()
            }
        }
    }, [permissionStatus, isSharingEnabled, SOCKET_SERVER_URL])

    useEffect(() => {
        if (!socket || !isSharingEnabled) return

        let watchId

        const handleLocationUpdate = (dataList) => {
            // console.log('dataList', dataList)
            const updatedDataList = dataList.map((data) => {
                if (data.hash === ownHashCode.current) {
                    data.isMe = true
                }
                return data
            })

            // dataList에서만 존재하는 사용자를 markerData 상태에 반영
            setMarkerData(updatedDataList)

            // 자신의 위치 데이터에 대한 처리
            const ownData = updatedDataList.find((data) => data.isMe)
            if (ownData) {
                if (!hasCenterBeenSetRef.current) {
                    setMapCenter(ownData)
                    hasCenterBeenSetRef.current = true
                } else if (isCentered) {
                    setMapCenter(ownData)
                }
            }
        }

        socket.on('update-location', handleLocationUpdate)

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    const location = { lat: latitude, lng: longitude }

                    socket.emit('share-location', location)
                    if (prevPosition) {
                        const bearing = calculateBearing(
                            prevPosition.lat,
                            prevPosition.lng,
                            location.lat,
                            location.lng,
                        )
                        // 위에서 계산된 bearing 값을 어떻게 사용할지 정의해야 합니다.
                    }

                    setPrevPosition(location)
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        // 위치 권한이 거부되었을 때의 처리
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                },
            )
        }

        return () => {
            if (socket) {
                socket.off('update-location', handleLocationUpdate)
            }
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId)
            }
        }

        return () => {
            if (socket) {
                socket.off('update-location', handleLocationUpdate)
            }
            clearInterval(intervalId)
        }
    }, [socket, isSharingEnabled, isCentered])

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        >
            {children}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={13}
                options={{
                    streetViewControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    rotateControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    disableDefaultUI: true,
                    clickableIcons: false,
                    styles: customStyles, // 여기에 스타일을 추가
                }}
            >
                {markerData &&
                    markerData.map((data, index) => {
                        // console.log(`Data ${index} ::  ${JSON.stringify(data)}`)
                        // const isMe = data.hash === myHash

                        return (
                            <Marker
                                key={data.hash}
                                position={{ lat: data.lat, lng: data.lng }}
                                label={{
                                    text: data.isMe ? '-' : 'X',
                                    color: 'white',
                                    fontSize: '10px',
                                }}
                                icon={{
                                    path: google.maps.SymbolPath
                                        .FORWARD_OPEN_ARROW,
                                    rotation: prevPosition
                                        ? calculateBearing(
                                              prevPosition.lat,
                                              prevPosition.lng,
                                              data.lat,
                                              data.lng,
                                          )
                                        : 0,

                                    scale: 5, // 마커의 크기
                                    fillColor: data.isMe
                                        ? '#f23920'
                                        : '#53389E', // 자신은 빨간색, 다른 사용자는 파란색
                                    fillOpacity: 0.5,
                                    strokeColor: 'white',
                                    strokeOpacity: 1,
                                    strokeWeight: 1,
                                    // url: 'path_to_your_image.png',
                                    // scaledSize: new google.maps.Size(40, 40), // 아이콘 이미지 크기를 40x40 픽셀로
                                }}
                            />
                        )
                    })}
            </GoogleMap>
        </LoadScript>
    )
}
