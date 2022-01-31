export default {
  webpack: {
    entryFile: './src/index.tsx',
    htmlFilename: 'index.html',
    htmlTemplate: './public/index.html',
    openOnStart: true,
    outputFile: 'bundle.js',
    outputPath: 'dist',
    port: 5070
  },
  package: {
    author: 'author_name',
    description: 'This is a default description',
    license: 'MIT',
    projectName: 'mern-web3-app',
    repositoryType: 'git',
    repositoryURL: 'repository_url',
    version: '0.0.1'
  },
  manifest: {
    backgroundColor: '#ffffff',
    description: 'This is a description for the new project',
    display: 'fullscreen',
    icons: '[]',
    name: 'New Project Name',
    orientation: 'portrait',
    shortName: 'New Project Short Name',
    startURL: '/',
    themeColor: '#ffffff'
  },
  meta: {
    description: 'This is the meta description for the new project'
  },
  express: {
    port: 4070,
    url: 'http://localhost'
  },
  mongo: {
    port: '27017',
    url: 'mongodb://localhost'
  }
}