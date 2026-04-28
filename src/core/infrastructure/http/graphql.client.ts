import api from './axios.instance'

/**
 * Standard GraphQL response shape.
 */
interface GraphQLResponse<T> {
  data: T
  errors?: GraphQLError[]
}

interface GraphQLError {
  message: string
  locations?: { line: number; column: number }[]
  path?: (string | number)[]
  extensions?: Record<string, unknown>
}

/**
 * GraphQL error wrapper for structured error handling.
 */
export class GraphQLRequestError extends Error {
  public readonly errors: GraphQLError[]

  constructor(errors: GraphQLError[]) {
    const message = errors.map((e) => e.message).join('; ')
    super(message)
    this.name = 'GraphQLRequestError'
    this.errors = errors
  }
}

/**
 * Executes a GraphQL query/mutation against the backend's `/graphql` endpoint.
 *
 * Uses the existing `api` axios instance (inherits auth, requestHub, error handling).
 *
 * @typeParam T — Shape of the `data` object returned by the query.
 * @param query — The GraphQL query or mutation string.
 * @param variables — Optional variables for the query.
 * @returns The `data` portion of the GraphQL response, typed as `T`.
 *
 * @example
 * ```ts
 * interface MaterialesData {
 *   getSapMateriales: { matnr: string; maktx: string }[]
 * }
 *
 * const data = await graphqlQuery<MaterialesData>(
 *   `query ($filter: String!) {
 *     getSapMateriales(filter: $filter) { matnr maktx }
 *   }`,
 *   { filter: "matkl eq 'P04000003'" }
 * )
 * ```
 */
export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await api.post<GraphQLResponse<T>>('/graphql', {
    query,
    variables,
  })

  if (response.data.errors?.length) {
    throw new GraphQLRequestError(response.data.errors)
  }

  return response.data.data
}
