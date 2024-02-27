import config from "./index";

const { secrets, dbVariables } = config();

module.exports = {
    development: {
        username: secrets.username,
        password: secrets.password,
        database: secrets.name,
        host: secrets.host,
        port: secrets.port,
        dialect: "postgres",
        dialectOptions: {
            bigNumberStrings: true,
        },
        databases: {
            Prod: {
                username: dbVariables.dbCustomerUsername,
                password: dbVariables.dbCustomerPassword,
                database: dbVariables.dbCustomerName,
                host: dbVariables.dbCustomerHost,
                port: 5432,
                dialect: "postgres",
                dialectOptions: {
                    bigNumberStrings: true,
                },
            },
            Simulation: {
                username: dbVariables.dbAuthUsername,
                password: dbVariables.dbAuthPassword,
                database: dbVariables.dbAuthName,
                host: dbVariables.dbAuthHost,
                port: 5432,
                dialect: "postgres",
                dialectOptions: {
                    bigNumberStrings: true,
                },
            },
        }
    }
}
// {
//   "development": {
//     "username": "postgres",
//     "password": "root",
//     "database": "picsou",
//     "host": "localhost",
//     "dialect": "postgresql"
//   },
//   "test": {
//     "username": "postgres",
//     "password": "root",
//     "database": "picsou",
//     "host": "localhost",
//     "dialect": "postgresql"
//   },
//   "simulation": {
//     "username": "postgres",
//     "password": "root",
//     "database": "picsou-simulation",
//     "host": "localhost",
//     "dialect": "postgresql"
//   },
//   "production": {
//     "username": "root",
//     "password": null,
//     "database": "erp-sii",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//   }
// }
