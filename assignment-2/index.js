require("dotenv").config();

const axios = require("axios");
const fs = require("fs/promises");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

function getWeatherReason(weatherMain) {
    const reasons = {
        Rain: "heavy rain",
        Snow: "snow",
        Extreme: "extreme weather conditions"
    };

    return reasons[weatherMain] || "adverse weather conditions";
}

async function generateWeatherApology(customer, city, weatherMain) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash"
        });

        const weatherReason = getWeatherReason(weatherMain);

        const prompt = `
Write exactly ONE short customer apology sentence.

Customer: ${customer}
Destination: ${city}
Weather condition: ${weatherMain}
Reason: ${weatherReason}

Mention that the order is delayed because of the weather and thank the customer for their patience.

Return ONLY the sentence.
Do not provide options, subject lines, placeholders, bullet points, or explanations.
        `;

        const result = await model.generateContent(prompt);

        return result.response.text().trim();
    } catch (error) {
        console.log(
            `Gemini apology generation failed for ${customer}'s order to ${city}.`
        );
        console.log(`Error: ${error.message}`);

        return `Hi ${customer}, your order to ${city} is delayed due to ${getWeatherReason(weatherMain)}. We appreciate your patience!`;
    }
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

        for (let index = 0; index < orders.length; index++) {
            const order = orders[index];
            const result = weatherResults[index];

            if (!result.success) {
                console.log(
                    `${order.order_id} | ${order.city} | Status unchanged: ${order.status}`
                );
                continue;
            }

            const weatherMain = result.weather.weather[0].main;

            order.status = shouldDelayOrder(weatherMain)
                ? "Delayed"
                : "Pending";

            console.log(
                `${order.order_id} | ${order.city} | ${weatherMain} | ${order.status}`
            );

            if (order.status === "Delayed") {
                order.apology = await generateWeatherApology(
                    order.customer,
                    order.city,
                    weatherMain
                );

                console.log(`AI Apology: ${order.apology}`);
            }
        }

        await saveOrders(orders);

        console.log("\norders.json updated successfully.");
    } catch (error) {
        console.log("Program failed:", error.message);
    }
}

main();
