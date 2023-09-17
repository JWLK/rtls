import React, { useState } from 'react'

const DashBoard_Popup = ({ isOpen, toggleIsOpen }) => {
    return (
        <>
            <div className={`bottom-menu ${isOpen ? 'open-half' : ''}`}>
                <button onClick={toggleIsOpen}>메뉴 열기/닫기</button>
                <ul>
                    <li>메뉴 항목 1</li>
                    <li>메뉴 항목 2</li>
                    <li>메뉴 항목 3</li>
                </ul>
            </div>
        </>
    )
}

export default DashBoard_Popup
