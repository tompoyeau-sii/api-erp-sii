module.exports = {
    "development": {
        "databases": {
            "production": {
                "database": "picsou", //you should always save these values in environment variables
                "username": "postgres",  //only for testing purposes you can also define the values here
                "password": "root",
                "host": "localhost",
                "dialect": "postgresql"  //here you need to define the dialect of your databse, in my case it is Postgres
            },
            "pettazzoni": {
                "database": "picsou-pettazzoni",
                "username": "postgres",
                "password": "root",
                "host": "localhost",
                "dialect": "postgresql"
            },
            "gourmel": {
                "database": "picsou-gourmel", //you should always save these values in environment variables
                "username": "postgres",  //only for testing purposes you can also define the values here
                "password": "root",
                "host": "localhost",
                "dialect": "postgresql"  //here you need to define the dialect of your databse, in my case it is Postgres
            }
        }
    }
}