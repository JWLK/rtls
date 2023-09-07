import { useState, useCallback } from 'react'
import { Button, Toggle } from '@carbon/react'
import {
    Location,
    WatsonHealthImageAvailabilityLocal,
} from '@carbon/icons-react'
import { GoogleMapsWrapper, socket } from '../components/GoogleMapsWrapper'

export default function Home() {
    const [isSharingEnabled, setSharingEnabled] = useState(false)
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
        <div>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    padding: '10px',
                }}
            >
                <Toggle
                    id="toggle-1"
                    labelText="Enable Location Sharing"
                    onToggle={handleToggle}
                    toggled={isSharingEnabled}
                    style={{ marginBottom: '10px' }}
                />
                <Button
                    onClick={toggleCentering}
                    kind={isCentered ? 'primary' : 'secondary'}
                    renderIcon={
                        isCentered
                            ? WatsonHealthImageAvailabilityLocal
                            : Location
                    }
                    hasIconOnly={true}
                    iconDescription={isCentered ? 'Center' : 'Free'}
                    disabled={!isSharingEnabled}
                />
            </div>
            <GoogleMapsWrapper
                isSharingEnabled={isSharingEnabled}
                isCentered={isCentered}
            />
        </div>
    )
}
