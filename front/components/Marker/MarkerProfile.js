import React from 'react'

/*
    <path fill="red" stroke="white" stroke-width="1.5" d="M3.5 3.5h25v25h-25z" ></path> 
*/
const MarkerProfile = (props) => {
    const { width, height } = props
    return `data:image/svg+xml;utf-8, 
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="white" stroke-width="5" fill="green" />
        <img src="./IMG_1709.png" alt="My Happy SVG" />
    </svg>`
}

export default MarkerProfile
