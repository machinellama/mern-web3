module.exports = {
  express: {
    port: {{express.port}},
    url: '{{express.url}}:{{express.port}}'
  },
  mongo: {
    port: {{mongo.port}},
    url: '{{mongo.url}}'
  },
  web: {
    port: {{webpack.port}}
  },
  authentication: {
    secret: 'abc123'
  }
}
