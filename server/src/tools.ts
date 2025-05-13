import { tool } from "@langchain/core/tools"
import { z } from "zod"

// Location tool implementation
export async function getLocation(): Promise<string> {
  // const response = await fetch("https://ipapi.co/json/")
  // const data = await response.json()
  // return JSON.stringify(data.city)
  // mocked response due to API Limits
  try {
    const response = { 
      ip: '154.47.16.85',
      network: '154.47.16.0/24',
      version: 'IPv4',
      city: 'Bogota',
      region: 'Bogota D.C.',
      region_code: 'DC',
      country: 'CO',
      country_name: 'Colombia',
      country_code: 'CO',
      country_code_iso3: 'COL',
      country_capital: 'Bogota',
      country_tld: '.co',
      continent_code: 'SA',
      in_eu: false,
      postal: '111411',
      latitude: 4.6071,
      longitude: -74.0879,
      timezone: 'America/Bogota',
      utc_offset: '-0500',
      country_calling_code: '+57',
      currency: 'COP',
      currency_name: 'Peso',
      languages: 'es-CO',
      country_area: 1138910,
      country_population: 49648685,
      asn: 'AS212238',
      org: 'Datacamp Limited'
    }
    return response.city
  } catch (err) {
    console.error((err as Error).message)
    return "Unknown"
  }
}
// Weather tool implementation
export async function getCurrentWeather(location: string): Promise<string> {
  console.log("location inside weather: ", location)
  
  try {
    // Clean up the location string if it contains quotes or extra characters
    const cleanLocation = location.replace(/['"]+/g, '').trim();
    
    const weatherUrl = new URL(`https://api.openweathermap.org/data/2.5/weather?q=${cleanLocation}&type=hour&appid=${process.env.OPEN_WEATHER_API_KEY}`)
    console.log("weatherUrl: ", weatherUrl)
    const res = await fetch(weatherUrl)
    const data = await res.json()
    console.log("weather: ", data)
    return JSON.stringify(data)
  } catch (err) {
    console.error((err as Error).message)
    return JSON.stringify({ error: "Failed to fetch weather data" })
  }
}

// Define LangChain tools with completely separate implementations
export const getLocationTool = tool(
  async () => {
    return await getLocation()
  },
  {
    name: "getLocation",
    description: "Get the user's current location (city name).",
    schema: z.object({})
  }
)

// Combined tool that already has the location fetching logic built-in
export const getCurrentWeatherTool = tool(
  async ({ cityName = null }) => {
    let location;
    
    if (!cityName || cityName === "current") {
      // If no city provided or "current" is specified, get the current location
      location = await getLocation();
      console.log("Using current location:", location);
    } else {
      location = cityName;
    }
    
    return await getCurrentWeather(location);
  },
  {
    name: "getCurrentWeather",
    description: "Get the current weather. Leave cityName empty or use 'current' to get weather for user's current location.",
    schema: z.object({
      cityName: z.string().optional().describe("Optional: The name of the city to get weather for. Leave empty to use current location."),
    })
  }
)