require("dotenv").config();

const axios = require("axios");

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

async function testWeather() {
    try {
        const weather = await getWeather("New York");

        console.log("City:", weather.name);
        console.log("Temperature:", weather.main.temp, "°C");
        console.log("Weather:", weather.weather[0].main);
    } catch (error) {
        console.log("Weather API request failed.");

        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Message:", error.response.data.message);
        } else {
            console.log("Error:", error.message);
        }
    }
}

testWeather();