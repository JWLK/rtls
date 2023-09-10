/** @type {import('next').NextConfig} */
const path = require('path')
const withPWA = require('next-pwa')
const withPlugins = require('next-compose-plugins')

const nextConfig = {
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

const pwaConfig = {
    pwa: {
        dest: 'public',
        // register: true,
        // skipWaiting: true,
        disable: process.env.NODE_ENV === 'development',
    },
}
module.exports = withPlugins([[withPWA, pwaConfig]], nextConfig)
