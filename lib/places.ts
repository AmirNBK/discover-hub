export type MapPlace = {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  distance?: number;
  curated?: boolean;
};
export type Coordinates = [number, number];
