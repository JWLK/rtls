import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'

const DashBoard_Popup = ({ isOpenViewStep, toggleIsOpen }) => {
    const handlers = useSwipeable({
        onSwipedUp: () => {
            if (isOpenViewStep == 1) {
                toggleIsOpen(2)
            }
            console.log('화면을 위로 스와이프했습니다.')
        },
        onSwipedDown: () => {
            if (isOpenViewStep == 1) {
                toggleIsOpen(0)
            } else if (isOpenViewStep == 2) {
                toggleIsOpen(1)
            }
            console.log('화면을 아래로 스와이프했습니다.')
        },
        swipeDuration: 500,
        preventScrollOnSwipe: true,
        trackMouse: true,
    })
    return (
        <div {...handlers}>
            <div
                className={`bottom-menu ${
                    isOpenViewStep == 0
                        ? ''
                        : isOpenViewStep == 1
                        ? 'open-half'
                        : 'open-full'
                }`}
            >
                {/* <button>메뉴 열기/닫기</button> */}
                <ul>
                    <li>메뉴 항목 1</li>
                    <li>메뉴 항목 2</li>
                    <li>메뉴 항목 3</li>
                </ul>
            </div>
        </div>
    )
}

export default DashBoard_Popup
