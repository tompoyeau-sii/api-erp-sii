export const fetchAllDbConfig = () => {
    const DBs = {
        CUSTOMER: "Prod",
        WALLET: "Simulation"
    };

    const dbVariables = {};
    for (let [key, value] of Object.entries(DBs)) {
        dbVariables[`db${value}URL`] = process.env[`DB_${key}_URL`] || "";
        dbVariables[`db${value}Name`] = process.env[`DB_${key}_NAME`] || "";
        dbVariables[`db${value}Host`] = process.env[`DB_${key}_HOST`] || "";
        dbVariables[`db${value}Password`] = process.env[`DB_${key}_PASSWORD`] || "";
        dbVariables[`db${value}Username`] = process.env[`DB_${key}_USERNAME`] || "";
    }
    return dbVariables;
};