const path = require('path')
const withPWA = require('next-pwa')

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

    // PWA configuration
    pwa: {
        dest: 'public',
        disable: process.env.NODE_ENV === 'development',
    },
}

module.exports = withPWA(nextConfig)
