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

async function saveOrders(orders) {
    const data = JSON.stringify(orders, null, 2);

    await fs.writeFile("orders.json", data, "utf-8");
}

async function main() {
    try {
        const orders = await loadOrders();

        console.log("Fetching weather concurrently...");

        const weatherResults = await Promise.all(
            orders.map(order => getWeather(order.city))
        );

        console.log("\nUpdating order statuses...");

        orders.forEach((order, index) => {
            const result = weatherResults[index];

            if (!result.success) {
                console.log(
                    `${order.order_id} | ${order.city} | Status unchanged: ${order.status}`
                );
                return;
            }

            const weatherMain = result.weather.weather[0].main;

            order.status = shouldDelayOrder(weatherMain)
                ? "Delayed"
                : "Pending";

            console.log(
                `${order.order_id} | ${order.city} | ${weatherMain} | ${order.status}`
            );
        });

        await saveOrders(orders);

        console.log("\norders.json updated successfully.");
    } catch (error) {
        console.log("Program failed:", error.message);
    }
}

main();
