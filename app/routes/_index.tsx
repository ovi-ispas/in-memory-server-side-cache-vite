import { LoaderFunctionArgs, json } from '@remix-run/node'
import { Form, useLoaderData, useNavigation } from '@remix-run/react'
import { pokemonResultsCache } from '../utils/cache.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get('query')
  console.log('query', query)

  // not searching for anything
  if (!query)
    return json({
      result: null,
      cachedQueries: pokemonResultsCache.map((c) => c.query),
    })

  // if query result is already in cache return it
  const cachedResult = pokemonResultsCache.find(
    (result) => result.query === query
  )
  if (cachedResult) {
    return json({
      result: cachedResult.result,
      cachedQueries: pokemonResultsCache.map((c) => c.query),
    })
  }

  // fetch result from api
  let result = null
  try {
    result = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`).then(
      (res) => res.json()
    )
  } catch (error) {
    console.log(error)
  }

  // add result to cache
  pokemonResultsCache.push({ query, result })

  return json({
    result,
    cachedQueries: pokemonResultsCache.map((c) => c.query),
  })
}

export default function Index() {
  const { result, cachedQueries } = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>In Memory Server Side Cache</h1>
      <Form method="get" action=".">
        <input type="text" name="query" placeholder="Pokemon name" />
        <button>
          {navigation.state !== 'idle' ? 'Searching...' : 'Search'}
        </button>
      </Form>
      <h2>Cached Queries</h2>
      <pre style={{ border: '1px solid', padding: 10 }}>
        {JSON.stringify(cachedQueries, null, 2)}
      </pre>
      {result ? (
        <>
          <h2>Result for {result.name}</h2>
          <pre style={{ border: '1px solid', padding: 10 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      ) : (
        <h2>No Results</h2>
      )}
    </div>
  )
}
