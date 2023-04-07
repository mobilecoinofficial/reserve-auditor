export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str
}

export function abbreviateHash(hash: string) {
  let leftLen = 7, rightLen = leftLen
  if (hash.startsWith('0x')) {
    leftLen += 2
  }
  const start = hash.slice(0, leftLen)
  const end = hash.slice(hash.length - rightLen, hash.length)
  return start + '...' + end
}
