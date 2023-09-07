/** @type {import('next').NextConfig} */
const path = require('path') // 1. path 선언

const nextConfig = {
    reactStrictMode: true,

    reactStrictMode: true,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        })
        return config
    },

    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
}

module.exports = nextConfig
