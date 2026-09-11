# Assignment 2: Weather-Aware Order Processing

## Overview

This project processes customer orders based on the current weather conditions at their destination.

For each order, the program:

1. Reads order data from `orders.json`.
2. Fetches the current weather for each destination using the OpenWeatherMap API.
3. Fetches weather for all orders concurrently using `Promise.all`.
4. Marks an order as `Delayed` when the weather condition is `Rain`, `Snow`, or `Extreme`.
5. Handles invalid cities and API errors without stopping the processing of other orders.
6. Uses Gemini AI to generate a personalized weather-aware apology for delayed orders.
7. Saves the updated order information back to `orders.json`.

## Tech Stack

- Node.js
- JavaScript
- Axios
- OpenWeatherMap API
- Google Gemini API
- dotenv

## Project Structure

assignment-2/
+-- .env.example
+-- .gitignore
+-- AI_LOG.md
+-- index.js
+-- orders.json
+-- package.json
+-- package-lock.json

## Prerequisites

- Node.js
- OpenWeatherMap API key
- Gemini API key

## Installation

Install dependencies:

npm install

## Environment Variables

Create a `.env` file inside the `assignment-2` directory:

OPENWEATHER_API_KEY=your_openweather_api_key
GEMINI_API_KEY=your_gemini_api_key

API keys are not stored in the repository.

The `.env` file is excluded using `.gitignore`.

## Running the Program

Run:

node index.js

The program reads the orders, fetches weather concurrently, updates order statuses, generates AI apologies for delayed orders, and saves the results to `orders.json`.

## Concurrent Weather Fetching

Weather requests are made concurrently using `Promise.all`:

const weatherResults = await Promise.all(
    orders.map(order => getWeather(order.city))
);

This allows multiple weather requests to run concurrently instead of waiting for each request to finish sequentially.

## Weather-Based Delay Logic

An order is marked as `Delayed` when the weather condition is:

- Rain
- Snow
- Extreme

Other weather conditions keep the order as `Pending`.

## Error Handling

Each weather request is handled independently.

If a city is invalid or the weather API returns an error:

- The error is logged.
- The affected order remains unchanged.
- Processing continues for the remaining orders.

This prevents one failed API request from terminating the complete workflow.

## AI-Powered Customer Apology

When an order is marked as `Delayed`, Gemini generates a short personalized apology using:

- Customer name
- Destination city
- Weather condition
- Weather-related delay reason

The prompt instructs Gemini to return exactly one short sentence.

If Gemini fails, the program uses a predefined fallback apology so the order-processing workflow can still complete.

## Example

For a delayed order caused by rain, Gemini may generate:

"Dear Alice Smith, we apologize that your order to New York is delayed due to heavy rain and thank you for your patience."

The exact generated wording may vary.

## Current Test Result

During testing:

- New York returned `Clouds`
- Mumbai returned `Clouds`
- London returned `Clouds`
- `InvalidCity123` returned a `404 city not found` error

The invalid city was logged without crashing the program, and the other orders completed successfully.

The Gemini apology function was also tested independently with a simulated `Rain` condition and successfully generated a personalized apology.

## Security

API keys are loaded from environment variables and are not hardcoded in the source code.

The following are excluded from Git:

- `.env`
- `node_modules/`

## AI Usage

AI assistance was used during development for implementation guidance, prompt design, and error-handling approaches.

The prompts and relevant AI-assisted development decisions are documented in `AI_LOG.md`.
