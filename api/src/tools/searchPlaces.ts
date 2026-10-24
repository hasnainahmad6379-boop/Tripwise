export const searchPlaces = async (destination: string, interests: string) => {
  const interestTypes: Record<string, string> = {
    history: "museum",
    historical: "museum",
    "historical sites": "museum",
    museums: "museum",
    food: "restaurant",
    restaurants: "restaurant",
    nature: "park",
    parks: "park",
  };

  const normalizedInterest = interests.toLowerCase().trim();

  const searchType =
    interestTypes[normalizedInterest] ||
    (normalizedInterest.includes("history")
      ? "museum"
      : normalizedInterest.includes("food")
        ? "restaurant"
        : normalizedInterest.includes("nature")
          ? "park"
          : normalizedInterest);

  const destinationResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
    {
      headers: { "User-Agent": "TripWise/1.0" },
    },
  );
  const destinationData = await destinationResponse.json();
  if (!destinationData.length) {
    return [];
  }
  const [south, north, west, east] = destinationData[0].boundingbox;
  const viewbox = `${west},${north},${east},${south}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchType)}&format=json&viewbox=${viewbox}&bounded=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "TripWise/1.0" },
  });

  const data = await response.json();

  return data
    .filter(
      (place: any) =>
        place.name && (place.type === searchType || place.class === "tourism"),
    )
    .slice(0, 5)
    .map((place: any) => ({
      name: place.name,
      category: place.type,
      class: place.class,
      location: place.display_name,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
    }));
};

export const findPlaceCoordinates = async (
  placeName: string,
  destination: string,
) => {
  const shortPlaceName = placeName.split(",")[0].trim();
  const query = `${shortPlaceName}, ${destination}`;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=jsonv2&limit=1`,
    {
      headers: {
        "User-Agent": "TripWise/1.0",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const results = (await response.json()) as {
    display_name: string;
    lat: string;
    lon: string;
  }[];

  if (!results.length) {
    return null;
  }

  const place = results[0];
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    location: place.display_name,
    latitude,
    longitude,
  };
};
