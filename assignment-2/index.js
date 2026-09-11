require("dotenv").config();

const axios = require("axios");
const fs = require("fs/promises");

async function getWeather(city) {
    try {
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

        return {
            success: true,
            city,
            weather: response.data
        };
    } catch (error) {
        console.log(`Weather request failed for ${city}.`);

        if (error.response) {
            console.log(
                `Status: ${error.response.status}, Message: ${error.response.data.message}`
            );
        } else {
            console.log(`Error: ${error.message}`);
        }

        return {
            success: false,
            city,
            error: error.response?.data?.message || error.message
        };
    }
}

function shouldDelayOrder(weatherMain) {
    const delayedConditions = ["Rain", "Snow", "Extreme"];

    return delayedConditions.includes(weatherMain);
}

async function loadOrders() {
    const data = await fs.readFile("orders.json", "utf-8");

    return JSON.parse(data);
}

async function main() {
    try {
        const orders = await loadOrders();

        console.log("Testing delay conditions:");
        console.log("Rain:", shouldDelayOrder("Rain"));
        console.log("Snow:", shouldDelayOrder("Snow"));
        console.log("Extreme:", shouldDelayOrder("Extreme"));
        console.log("Clouds:", shouldDelayOrder("Clouds"));

        console.log("\nFetching weather concurrently...");

        const weatherResults = await Promise.all(
            orders.map(order => getWeather(order.city))
        );

        console.log("\nWeather results:");

        weatherResults.forEach(result => {
            if (result.success) {
                console.log(
                    `${result.city}: ${result.weather.weather[0].main}`
                );
            } else {
                console.log(
                    `${result.city}: Failed - ${result.error}`
                );
            }
        });
    } catch (error) {
        console.log("Program failed:", error.message);
    }
}

main();
