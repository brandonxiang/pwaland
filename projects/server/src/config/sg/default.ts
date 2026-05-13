export default {
  mysql: {
    host: '',
    port: 3333,
    user: '',
    password: '',
    database: '',
  },
  redis: {
    password: '',
    sentinels: [],
    cluster: [
      {
        host: '',
        port: 3333,
      },
    ],
  },
};
