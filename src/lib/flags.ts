// src/lib/flags.ts
export function flagEmoji(flagUrl: string): string {
  if (!flagUrl) return '🏳️'
  
  // Extraer código de país de la URL: https://flagcdn.com/w160/mx.png → mx
  const match = flagUrl.match(/\/([a-z]{2})\.png$/i)
  if (!match) return '🏳️'
  
  const code = match[1].toUpperCase()
  
  // Convertir código ISO a emoji de bandera
  const codePoints = [...code].map(c => 
    0x1F1E6 + c.charCodeAt(0) - 'A'.charCodeAt(0)
  )
  return String.fromCodePoint(...codePoints)
}