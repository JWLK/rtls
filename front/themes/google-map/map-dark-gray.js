// https://snazzymaps.com/style/287008/me-and-all
export const MapTheme_DarkGray = [
    {
        featureType: 'all',
        elementType: 'all',
        stylers: [
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'all',
        elementType: 'geometry',
        stylers: [
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [
            {
                saturation: 36,
            },
            {
                color: '#000000',
            },
            {
                lightness: 40,
            },
        ],
    },
    {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [
            {
                visibility: 'on',
            },
            {
                color: '#000000',
            },
            {
                lightness: 16,
            },
        ],
    },
    {
        featureType: 'all',
        elementType: 'labels.icon',
        stylers: [
            {
                visibility: 'simplified',
            },
            {
                lightness: -30, // 밝기를 조절합니다. 값의 범위는 -100에서 100까지이며, 양수 값은 밝게, 음수 값은 어둡게 만듭니다.
            },
            {
                saturation: -30, // 채도를 조절합니다. 값의 범위는 -100에서 100까지이며, -100은 완전한 회색조로, 100은 완전히 포화된 색상으로 변환합니다.
            },
            {
                weight: 0, //라인의 두께나 경계의 두께를 지정합니다.
            },
            // {
            //     hue: '#000000', //기본 색상의 조절입니다. 예: "#ff0000"는 빨간색의 색조를 나타냅니다.
            // },
            {
                gamma: 0.7, //감마 값을 조절하여 선명도를 변경합니다. 0.01에서 10.0 사이의 값을 사용할 수 있습니다. 1.0은 기본값입니다.
            },
            {
                invert_lightness: false, // <-> true 밝기를 반전시킵니다.
            },
            {
                opacity: 0.5, // 투명도를 조절합니다. 0.0(완전 투명)에서 1.0(완전 불투명)까지의 값을 사용할 수 있습니다.
            },
        ],
    },
    {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#000000',
            },
            {
                lightness: 17,
            },
            {
                weight: 1.2,
            },
        ],
    },
    {
        featureType: 'administrative.country',
        elementType: 'geometry',
        stylers: [
            {
                color: '#868686',
            },
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'administrative.country',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#d2d2d2',
            },
        ],
    },
    {
        featureType: 'administrative.province',
        elementType: 'geometry',
        stylers: [
            {
                color: '#676767',
            },
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#848484',
            },
        ],
    },
    {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [
            {
                color: '#000000',
            },
            {
                lightness: 20,
            },
        ],
    },
    {
        featureType: 'landscape',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#212121',
            },
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [
            {
                visibility: 'on',
            },
            {
                color: '#212121',
            },
        ],
    },
    {
        featureType: 'landscape.natural',
        elementType: 'geometry.fill',
        stylers: [
            {
                visibility: 'on',
            },
            {
                color: '#212121',
            },
        ],
    },
    {
        featureType: 'landscape.natural.landcover',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#212121',
            },
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'landscape.natural.terrain',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#212121',
            },
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
            {
                lightness: 21,
            },
            {
                color: '#212121',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
            {
                color: '#181818',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
            {
                visibility: 'simplified',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
            {
                visibility: 'simplified',
            },
            {
                color: '#3c3c3c',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            {
                lightness: 29,
            },
            {
                weight: 0.2,
            },
        ],
    },
    {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [
            {
                color: '#4e4e4e',
            },
            {
                visibility: 'simplified',
            },
            {
                lightness: '-20',
            },
        ],
    },
    {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [
            {
                visibility: 'simplified',
            },
            {
                color: '#373737',
            },
        ],
    },
    {
        featureType: 'road.arterial',
        elementType: 'geometry.fill',
        stylers: [
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'road.local',
        elementType: 'geometry',
        stylers: [
            {
                lightness: 16,
            },
            {
                color: '#313131',
            },
            {
                visibility: 'simplified',
            },
        ],
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [
            {
                color: '#212121',
            },
            {
                lightness: 19,
            },
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
            {
                color: '#000000',
            },
            {
                visibility: 'on',
            },
        ],
    },
]
