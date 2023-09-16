import React, { useEffect, useState, useRef } from 'react'

import {
    GoogleMap,
    LoadScript,
    Marker,
    OverlayView,
} from '@react-google-maps/api'
import { MapTheme_DarkGreen } from '../themes/google-map/map-dark-green'
import { MapTheme_DarkGray } from '../themes/google-map/map-dark-gray'
// import { InfoWindow } from '@react-google-maps/api'; // 현재 InfoWindow는 주석 처리 되어 있음

import KalmanFilter from 'kalmanjs'

import io from 'socket.io-client'

const containerStyle = {
    width: '100vw',
    height: '100vh',
}

const initialCenter = {
    lat: 37.57972779165909,
    lng: 126.97704086507996,

    //37.57972779165909, 126.97704086507996
}
const initialZoom = 15

const customStyles = MapTheme_DarkGray

//Karman
const kalmanFilterLat = new KalmanFilter()
const kalmanFilterLng = new KalmanFilter()

export function GoogleMapsWrapper({ children, isSharingEnabled, isCentered }) {
    const [permissionStatus, setPermissionStatus] = useState(null) // 위치 권한 상태 저장
    const [socket, setSocket] = useState(null)

    const [markerData, setMarkerData] = useState([])
    const [mapCenter, setMapCenter] = useState(initialCenter)
    const [mapZoom, setMapZoom] = useState(initialZoom)
    const hasCenterBeenSetRef = useRef(false)
    const ownHashCode = useRef(null)

    //Location View
    const [prevPosition, setPrevPosition] = useState(null)
    const [currentSpeed, setCurrentSpeed] = useState(0) // 현재 속도 저장

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3
        const phi1 = (lat1 * Math.PI) / 180
        const phi2 = (lat2 * Math.PI) / 180
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

        const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) *
                Math.cos(phi2) *
                Math.sin(deltaLambda / 2) *
                Math.sin(deltaLambda / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
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
                    const filteredLat = kalmanFilterLat.filter(latitude)
                    const filteredLng = kalmanFilterLng.filter(longitude)

                    const location = { lat: latitude, lng: longitude }

                    socket.emit('share-location', location)

                    // 속도 계산
                    if (prevPosition) {
                        const deltaTime =
                            (position.timestamp -
                                (prevPosition.timestamp || 0)) /
                            1000
                        if (deltaTime > 0) {
                            // deltaTime이 0보다 큰 경우에만 속도 계산
                            const distance = calculateDistance(
                                prevPosition.lat,
                                prevPosition.lng,
                                location.lat,
                                location.lng,
                            )
                            const speed = distance / deltaTime
                            setCurrentSpeed(speed * 3.6) // m/s to km/h
                        }
                    }

                    setPrevPosition({
                        ...location,
                        timestamp: position.timestamp,
                    })
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
    }, [socket, isSharingEnabled, isCentered])

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        >
            {children}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={mapZoom}
                options={{
                    streetViewControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    rotateControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
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
                            <React.Fragment
                                key={`markerData-${index}`}
                                styles={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Marker
                                    key={data.hash}
                                    position={{ lat: data.lat, lng: data.lng }}
                                    label={{
                                        text: data.isMe ? 'Me' : 'other',
                                        color: 'white',
                                        fontSize: '10px',
                                    }}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 15, // 마커의 크기
                                        fillColor: data.isMe
                                            ? '#fff'
                                            : '#53389E', // 자신은 빨간색, 다른 사용자는 파란색
                                        fillOpacity: 1,
                                        strokeColor: 'white',
                                        strokeOpacity: 0,
                                        strokeWeight: 0,
                                        // url: 'path_to_your_image.png',
                                        // scaledSize: new google.maps.Size(40, 40), // 아이콘 이미지 크기를 40x40 픽셀로
                                    }}
                                />
                                <OverlayView
                                    position={{ lat: data.lat, lng: data.lng }}
                                    mapPaneName={
                                        OverlayView.OVERLAY_MOUSE_TARGET
                                    }
                                >
                                    <div
                                        className={
                                            data.isMe
                                                ? 'pulsingOverlayRed'
                                                : 'pulsingOverlayBlue'
                                        }
                                    >
                                        <>
                                            {/* <div className="centerDot"></div> */}
                                        </>
                                    </div>
                                </OverlayView>

                                {data.isMe && (
                                    <OverlayView
                                        position={{
                                            lat: data.lat,
                                            lng: data.lng,
                                        }}
                                        mapPaneName={
                                            OverlayView.OVERLAY_MOUSE_TARGET
                                        }
                                    >
                                        <div className="speedInfo">
                                            {`${currentSpeed.toFixed(2)} km/h`}
                                        </div>
                                    </OverlayView>
                                )}
                            </React.Fragment>
                        )
                    })}
            </GoogleMap>
        </LoadScript>
    )
}
