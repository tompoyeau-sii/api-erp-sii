module.exports = {
    "development": {
        "databases": {
            "production": {
                "database": "picsou", //you should always save these values in environment variables
                "username": "postgres",  //only for testing purposes you can also define the values here
                "password": "root",
                "host": "localhost",
                "dialect": "postgres"  //here you need to define the dialect of your databse, in my case it is Postgres
            },
            "simulation": {
                "database": "picsou-simulation",
                "username": "postgres",
                "password": "root",
                "host": "localhost",
                "dialect": "postgres"
            },
        }
    }
}