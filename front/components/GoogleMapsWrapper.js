import React, { useEffect, useState, useRef } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
// import { InfoWindow } from '@react-google-maps/api'; // 현재 InfoWindow는 주석 처리 되어 있음

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

export function GoogleMapsWrapper({ children, isSharingEnabled, isCentered }) {
    const [markerData, setMarkerData] = useState(null)
    const [mapCenter, setMapCenter] = useState(initialCenter)
    const hasCenterBeenSetRef = useRef(false)

    useEffect(() => {
        if (!isSharingEnabled) {
            hasCenterBeenSetRef.current = false
            return // 위치 공유가 비활성화면 아무 것도 하지 않음
        }

        const socket = io('http://localhost:3000')

        socket.on('connect', () => {
            console.log('Connected to the server')
        })

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error)
        })

        socket.on('update location', (data) => {
            setMarkerData(data)
            if (!hasCenterBeenSetRef.current) {
                // 추가: 최초 설정이 아직 안 되었을 때만 실행
                setMapCenter(data)
                hasCenterBeenSetRef.current = true
            } else if (isCentered) {
                setMapCenter(data)
            }
        })

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords
                    const location = {
                        lat: latitude,
                        lng: longitude,
                    }
                    socket.emit('share location', location)
                })
            }
        }

        const intervalId = setInterval(updateLocation, 300)

        return () => {
            socket.disconnect()
            clearInterval(intervalId)
        }
    }, [isCentered, isSharingEnabled])

    return (
        <LoadScript googleMapsApiKey="AIzaSyBF5q06rev3BDsaD9vajgYaaCM5UpQvlUU">
            {children}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={20}
                options={{
                    streetViewControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    rotateControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                }}
            >
                {markerData && (
                    <Marker
                        position={markerData}
                        label={{
                            text: markerData.ip,
                            color: 'black',
                            fontSize: '12px',
                        }}
                    />
                )}
            </GoogleMap>
        </LoadScript>
    )
}
