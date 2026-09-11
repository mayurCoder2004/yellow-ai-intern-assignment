require("dotenv").config();

const axios = require("axios");
const fs = require("fs/promises");

async function getWeather(city) {
    const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
            params: {
                q: city,
                appid: process.env.OPENWEATHER_API_KEY,
                units: "metric"
            }
        }
    );

    return response.data;
}

async function loadOrders() {
    const data = await fs.readFile("orders.json", "utf-8");

    return JSON.parse(data);
}

async function main() {
    try {
        const orders = await loadOrders();

        console.log("Orders loaded successfully:");
        console.log(orders);
    } catch (error) {
        console.log("Failed to load orders.");
        console.log("Error:", error.message);
    }
}

main();