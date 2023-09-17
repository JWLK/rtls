import React, { useEffect, useState, useRef } from 'react'

import io from 'socket.io-client'
import {
    GoogleMap,
    LoadScript,
    Marker,
    OverlayView,
} from '@react-google-maps/api'
// const google = window.google

import { MapTheme_DarkGreen } from '../themes/google-map/map-dark-green'
import { MapTheme_DarkGray } from '../themes/google-map/map-dark-gray'
const customStyles = MapTheme_DarkGray
// import { InfoWindow } from '@react-google-maps/api'; // 현재 InfoWindow는 주석 처리 되어 있음
const containerStyle = {
    width: '100vw',
    height: 'calc(100vh - env(safe-area-inset-bottom))',
}
const initialCenter = {
    lat: 37.57972779165909,
    lng: 126.97704086507996,
}
const initialZoom = 15
const focusZoom = 18

//Get Component
import MarkerProfile from './Marker/MarkerProfile'
const svgCode = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="30" stroke="white" stroke-width="5" fill="rgba(0,0,0,0.5)" />
        <!-- 이미지를 원 모양으로 자릅니다. -->
        <clipPath id="circle-clip">
            <circle cx="30" cy="30" r="40" />
        </clipPath>

        <!-- 이미지를 원 안에 배치하고 clip-path를 적용합니다. -->
        <image x="30" y="30" width="30" height="30" xlink:href="https://roadaround.club/IMG_1709.png/" alt="My Happy SVG" clip-path="url(#circle-clip)" />
    </svg>`

export default function GoogleMapsWrapper({
    children,
    isSharingEnabled,
    isCentered,
    setIsCentered,
}) {
    const [permissionStatus, setPermissionStatus] = useState(null) // 위치 권한 상태 저장
    const [socket, setSocket] = useState(null)
    const [hasFetchedInitialLocation, setHasFetchedInitialLocation] =
        useState(false)

    const [markerData, setMarkerData] = useState([])
    const [mapCenter, setMapCenter] = useState(initialCenter)
    const [mapZoom, setMapZoom] = useState(initialZoom)
    const hasCenterBeenSetRef = useRef(false)
    const ownHashCode = useRef(null)
    const mapRef = useRef(null) // Google 지도 인스턴스에 대한 참조

    //Location View
    const [currentSpeed, setCurrentSpeed] = useState(0) // 현재 속도 저장

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
                        if (!hasFetchedInitialLocation) {
                            // 한 번만 위치를 설정하고 이후에는 업데이트하지 않도록 확인
                            const { latitude, longitude } = position.coords
                            const location = { lat: latitude, lng: longitude }
                            setMapCenter(location)
                            setHasFetchedInitialLocation(true)
                        }
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
                    const { latitude, longitude, speed } = position.coords

                    const location = { lat: latitude, lng: longitude }

                    socket.emit('share-location', location)
                    setCurrentSpeed(speed * 3.6) // m/s to km/h
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

    useEffect(() => {
        if (isCentered) {
            setMapZoom(focusZoom)
        }
    }, [isCentered])

    return (
        <>
            {children}
            <GoogleMap
                onLoad={(map) => {
                    mapRef.current = map
                }}
                mapContainerStyle={containerStyle}
                center={mapCenter}
                onDrag={() => {
                    setIsCentered(false)
                }}
                zoom={mapZoom}
                onZoomChanged={() => {
                    // Google 지도의 줌 레벨이 변경될 때 mapZoom 상태를 업데이트합니다.
                    const newZoom = mapRef.current?.getZoom() // Google 지도의 현재 줌 레벨을 가져옵니다.
                    setMapZoom(newZoom) // mapZoom 상태를 업데이트합니다.
                }}
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

                        const getMarkerData = MarkerProfile(50, 50)
                        return (
                            <React.Fragment key={`markerData-${index}`}>
                                <Marker
                                    key={data.hash}
                                    position={{
                                        lat: data.lat,
                                        lng: data.lng,
                                    }}
                                    label={{
                                        text: data.isMe ? ' ' : ' ',
                                        color: 'white',
                                        fontSize: '10px',
                                    }}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 15, // 마커의 크기
                                        fillColor: data.isMe
                                            ? '#f23920'
                                            : '#53389E', // 자신은 빨간색, 다른 사용자는 파란색
                                        fillOpacity: 1,
                                        strokeColor: 'white',
                                        strokeOpacity: 1,
                                        strokeWeight: 5,
                                        // url: 'path_to_your_image.png',
                                        // scaledSize: new google.maps.Size(40, 40), // 아이콘 이미지 크기를 40x40
                                    }}
                                    // animation={google.maps.Animation.BOUNCE}
                                />

                                {/* <OverlayView
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
                                    ></div>
                                </OverlayView> */}

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
        </>
    )
}
