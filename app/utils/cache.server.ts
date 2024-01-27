/* Until a server restart, this will be kept in memory and shared by all clients that connect to the server.
Note: With the new remix vite plugin, the data also won't get lost in development due to HDR) */

type PokemonResult = { query: string; result: string }

export const pokemonResultsCache: PokemonResult[] = []
