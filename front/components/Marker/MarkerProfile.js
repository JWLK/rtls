import React from 'react'

/*
    <path fill="red" stroke="white" stroke-width="1.5" d="M3.5 3.5h25v25h-25z" ></path> 
*/
const MarkerProfile = (props) => {
    const { width, height } = props
    return `data:image/svg+xml;utf-8, 
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="white" stroke-width="5" fill="green" />
         <clipPath id="circle-clip">
            <circle cx="50" cy="50" r="40" />
        </clipPath>

        <!-- 이미지를 원 안에 배치하고 clip-path를 적용합니다. -->
        <image x="10" y="10" width="80" height="80" xlink:href="https://roadaround.club/IMG_1709.png/" alt="My Happy SVG" clip-path="url(#circle-clip)" />
    </svg>`
}

export default MarkerProfile
