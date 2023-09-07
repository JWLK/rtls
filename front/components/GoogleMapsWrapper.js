import React, { useEffect, useState, useRef } from 'react'

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
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

export function GoogleMapsWrapper({ children, isSharingEnabled, isCentered }) {
    const [markerData, setMarkerData] = useState([])
    const [mapCenter, setMapCenter] = useState(initialCenter)
    const hasCenterBeenSetRef = useRef(false)
    const ownHashCode = useRef(null)

    const SOCKET_SERVER_URL =
        process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000'

    useEffect(() => {
        if (!isSharingEnabled) {
            hasCenterBeenSetRef.current = false
            return // 위치 공유가 비활성화면 아무 것도 하지 않음
        }

        const socket = io(SOCKET_SERVER_URL)

        socket.on('connect', () => {
            console.log('Connected to the server')
        })

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error)
        })

        socket.on('client-hash', (hash) => {
            console.log('hash', hash)
            ownHashCode.current = hash
        })

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

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords
                    const location = {
                        lat: latitude,
                        lng: longitude,
                    }
                    // console.log('newData :: ' + JSON.stringify(location))
                    socket.emit('share-location', location)
                })
            }
        }
        const intervalId = setInterval(updateLocation, 300)

        return () => {
            socket.off('update location', handleLocationUpdate)
            socket.disconnect()
            clearInterval(intervalId)
        }
    }, [isCentered, isSharingEnabled, SOCKET_SERVER_URL])

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
                                    text: data.isMe ? 'You' : 'other',
                                    color: 'white',
                                    fontSize: '10px',
                                }}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: 20, // 마커의 크기
                                    fillColor: data.isMe
                                        ? '#f23920'
                                        : '#53389E', // 자신은 빨간색, 다른 사용자는 파란색
                                    fillOpacity: 0.7,
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
