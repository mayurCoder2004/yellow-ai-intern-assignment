# AI Log

## Assignment 2: Weather-Aware Order Processing

AI assistance was used during development to understand implementation approaches, improve error handling, design the Gemini prompt, and review the overall workflow.

---

## 1. Parallel Fetching

### Prompt Used

I asked AI for guidance on how to fetch weather data for multiple orders concurrently in Node.js instead of making the API requests sequentially.

### Approach Used

The recommended approach was to use Promise.all() with Array.map().

const weatherResults = await Promise.all(
    orders.map(order => getWeather(order.city))
);

This starts the weather requests concurrently and waits for all requests to complete.

### Implementation

The final implementation uses Promise.all() to fetch weather for every order concurrently.

---

## 2. Error Handling

### Prompt Used

I asked AI how to handle an invalid city or weather API failure without allowing one failed request to terminate processing for the remaining orders.

### Approach Used

The recommended approach was to handle errors inside the individual getWeather() function rather than allowing the error to reject the entire Promise.all() operation.

The function returns a structured result:

return {
    success: false,
    city,
    error: error.response?.data?.message || error.message
};

This allows the main workflow to continue processing the successful weather requests.

### Result

When InvalidCity123 returned a 404 city not found response:

- The error was logged.
- The affected order remained unchanged.
- New York, Mumbai, and London continued processing successfully.
- The program did not crash.

---

## 3. Gemini Weather-Aware Apology

### Prompt Used

The following prompt was used to generate the personalized customer apology:

Write exactly ONE short customer apology sentence.

Customer: ${customer}
Destination: ${city}
Weather condition: ${weatherMain}
Reason: ${weatherReason}

Mention that the order is delayed because of the weather and thank the customer for their patience.

Return ONLY the sentence.
Do not provide options, subject lines, placeholders, bullet points, or explanations.

### Purpose

The prompt ensures that the generated message:

- Is personalized using the customer's name.
- Mentions the destination.
- Explains the weather-related delay.
- Thanks the customer for their patience.
- Produces one short sentence rather than multiple options.

### Test Result

The Gemini function was tested using:

Customer: Alice Smith
Destination: New York
Weather condition: Rain

Gemini successfully generated a personalized apology:

Dear Alice Smith, we apologize that your order to New York is delayed due to heavy rain and thank you for your patience.

The exact generated wording may vary between requests.

---

## 4. AI-Assisted Development Summary

AI was used as a development assistant for:

- Understanding concurrent API requests with Promise.all().
- Designing per-request error handling.
- Designing the weather-aware apology prompt.
- Reviewing implementation approaches and edge cases.

The final code was implemented, tested, and verified locally.
