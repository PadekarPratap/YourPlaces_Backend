import axios from "axios";

const API_KEY = "65ca5f9645ba3708299331fxo73f823";

export const addressToCoordinates = async (address) => {
  const res = await axios.get(
    `https://geocode.maps.co/search?q=${address}&api_key=${API_KEY}`
  );

  const { data } = res;

  const coordinates = {
    lat: data[0].lat,
    lng: data[0].lon,
  };

  return coordinates;
};
