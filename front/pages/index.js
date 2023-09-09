import { useState, useCallback } from 'react'
import { Button, Toggle } from '@carbon/react'
import {
    Location,
    WatsonHealthImageAvailabilityLocal,
    LocationPersonFilled,
} from '@carbon/icons-react'
import { GoogleMapsWrapper, socket } from '../components/GoogleMapsWrapper'

export default function Home() {
    const [isSharingEnabled, setSharingEnabled] = useState(true)
    const [isCentered, setIsCentered] = useState(false)

    const handleToggle = useCallback((toggled) => {
        setSharingEnabled(toggled)
        console.log('toggled :: ' + toggled)
        console.log('isCentered :: ' + isCentered)
        if (!toggled) {
            setIsCentered(false) // 위치 공유가 OFF면 중앙 고정도 OFF
        }
    }, [])

    const toggleCentering = useCallback(() => {
        setIsCentered(!isCentered)
    }, [isCentered])

    return (
        <>
            <div>
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        left: 3,
                        zIndex: 10,
                        padding: '10px',
                    }}
                >
                    <div
                        style={{
                            color: '#F23920',
                            fontFamily: 'Inter',
                            fontSize: '12px',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            lineHeight: 'normal',
                            textDecoration: 'underline',
                            textUnderlineOffset: '5px',
                            backdropFilter: 'blur(1px)',
                            padding: '10px 5px',
                        }}
                    >
                        ROAD AROUND CLUB
                    </div>
                </div>

                {/* DEV MANUAL LOACTION MODE */}
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        top: 25,
                        right: 10,
                        zIndex: 10,
                        padding: '10px',
                        visibility: 'hidden',
                    }}
                >
                    <Toggle
                        id="toggle-1-location-share"
                        labelText="" //SHARE LOCATION
                        onToggle={handleToggle}
                        toggled={isSharingEnabled}
                        size={'md'}
                        hideLabel
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        top: '50vh',
                        right: 3,
                        zIndex: 10,
                        padding: '10px',
                        opacity: '0.7',
                    }}
                >
                    <Button
                        onClick={toggleCentering}
                        kind={isCentered ? 'primary' : 'secondary'}
                        renderIcon={
                            isCentered ? LocationPersonFilled : Location
                        }
                        hasIconOnly={true}
                        iconDescription={isCentered ? 'Center' : 'Free'}
                        disabled={!isSharingEnabled}
                        style={{
                            boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;',
                        }}
                    />
                </div>
                <div className="gradient-container">
                    <GoogleMapsWrapper
                        isSharingEnabled={isSharingEnabled}
                        isCentered={isCentered}
                    />
                </div>
            </div>
        </>
    )
}
