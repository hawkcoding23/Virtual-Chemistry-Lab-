export const LAB_STATIONS = [
  { id: "main", x: 0, z: 0, label: "Central reaction bench" },
];

// These are apparatus zones along one continuous bench, not separate stations.
export const stationPosition = (setupType) => ({
  ignition: [0, 0],
  mixing: [-4.7, 0],
  electrolysis: [4.7, 0],
  main: [0, 0],
}[setupType] ?? [0, 0]);
