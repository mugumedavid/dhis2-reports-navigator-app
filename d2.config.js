const config = {
    type: 'app',
    title: 'Reports Navigator',
    description: 'A card gallery for finding and opening saved DHIS2 reports, organised into groups.',
    icon: './src/dhis2-app-icon.png',
    minDHIS2Version: '2.40',
    maxDHIS2Version: '2.42',
    entryPoints: {
        app: './src/App.jsx',
    },
}

module.exports = config
