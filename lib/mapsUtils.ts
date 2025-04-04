/**
 * Fetches a human-readable location description from Google Maps Geocoding API.
 *
 * @param lat Latitude.
 * @param lng Longitude.
 * @returns A formatted address string or null if an error occurs or no results are found.
 */
export async function getReverseGeocoding(
  lat: number,
  lng: number,
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error(
      "Google Maps API key is missing. Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.",
    );
    return null;
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    console.error("Invalid latitude or longitude provided.");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`; // Added language=es for Spanish results

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(
        `Reverse geocoding failed: ${data.status} - ${data.error_message || "Unknown error"}`,
      );
      return null;
    }

    // Extract street name and number instead of full formatted address
    if (data.results && data.results.length > 0) {
      const components = data.results[0].address_components;
      let streetNumber = "";
      let route = "";

      for (const component of components) {
        if (component.types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (component.types.includes("route")) {
          route = component.long_name;
        }
      }

      // Combine route and street number if both exist
      if (route && streetNumber) {
        return `${route} ${streetNumber}`;
      }
      // Fallback to just route if number is missing
      if (route) {
        return route;
      }
      // Fallback to the first formatted address if specific components aren't found
      console.warn(
        "Could not extract street name/number, falling back to formatted address.",
      );
      return data.results[0].formatted_address || null;
    }

    console.warn("No reverse geocoding results found for the coordinates.");
    return null;
  } catch (error) {
    console.error("Error fetching reverse geocoding data:", error);
    return null;
  }
} 