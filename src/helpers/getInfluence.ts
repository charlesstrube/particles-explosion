const getInfluence = (distance: number, radius: number): number => {
  const normalizedDistance = distance / radius;
  const square = Math.pow(normalizedDistance, 2);
  return Math.exp(-square / 2);
};

export default getInfluence;