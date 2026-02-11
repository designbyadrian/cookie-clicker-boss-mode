export function getRandomClickSound() {
  return getRandomSound("click", 7);
}

export function getRandomBuySound() {
  return getRandomSound("buy", 5);
}

export function getRandomSellSound() {
  return getRandomSound("sell", 4);
}

export function getRandomSound(name, N) {
  const index = Math.floor(Math.random() * N) + 1; // 1 to N
  return `snd/${name}${index}.mp3`;
}
