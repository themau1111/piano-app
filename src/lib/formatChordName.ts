export function formatChordName(name: string): string {
  return name.replace(/^([A-G]#?)M$/, "$1");
}
