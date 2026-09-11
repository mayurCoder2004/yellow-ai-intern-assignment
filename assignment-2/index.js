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

        console.log("Fetching weather concurrently...");

        const weatherResults = await Promise.all(
            orders.map(order => getWeather(order.city))
        );

        console.log("Weather results:");
        console.log(weatherResults);
    } catch (error) {
        console.log("Weather fetching failed.");

        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Message:", error.response.data.message);
        } else {
            console.log("Error:", error.message);
        }
    }
}

main();