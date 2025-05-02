// custom tool to get weather data from the OpenWeather API
export async function getCurrentWeather({ location }) {
  try {
      const weatherUrl = new URL("https://apis.scrimba.com/openweathermap/data/2.5/weather")
      weatherUrl.searchParams.append("q", location)
      weatherUrl.searchParams.append("units", "imperial")
      const res = await fetch(weatherUrl)
      const data = await res.json()
      return JSON.stringify(data)
  } catch(err) {
      console.error(err.message)
  }
}

// custom tool
export async function getLocation() {
  try {
      const response = await fetch('https://ipapi.co/json/')
      const text = await response.json()
      return JSON.stringify(text)
  } catch (err) {
      console.error(err.message)
  }
}

// OpenAI tools configuration to be passed to the LLM model
export const tools = [
  {
      function: getCurrentWeather,
      parse: JSON.parse,
      parameters: {
          type: "object",
          properties: {
              location: {
                  type: "string",
                  description: "The name of the city from where to get the weather"
              }
          },
          required: ["location"]
      }
  },
  {
      function: getLocation,
      parameters: {
          type: "object",
          properties: {}
      }
  },
]