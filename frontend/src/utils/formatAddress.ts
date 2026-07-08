export function formatAddress(address?: string, start = 6, end = 4) {
  if (!address) {
    return "0x0000...0000";
  }

  if (address.length <= start + end) {
    return address;
  }

  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatHash(hash?: string, start = 10, end = 12) {
  if (!hash) {
    return "";
  }

  if (hash.length <= start + end) {
    return hash;
  }

  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

