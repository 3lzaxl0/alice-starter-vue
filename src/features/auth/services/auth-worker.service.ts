import { graphqlQuery } from '@core/infrastructure/http/graphql.client'
import type { BsTrabajador } from '../domain/models/worker.model'

interface GetTrabajadoresResponse {
  getBsTrabajadores: BsTrabajador[]
}

const GET_TRABAJADOR_QUERY = `
  query GetTrabajador($dni: String!) {
    getBsTrabajadores(filter: { nroDoc: $dni, estados: ["1"] }) {
      nroDoc
      nombres
      cencos
      descCencos
      descArea
      descSeccion
      flagEstado
    }
  }
`

const GET_TRABAJADORES_BY_CENCOS_QUERY = `
  query GetTrabajadoresByCencos($cencos: String!) {
    getBsTrabajadores(filter: { cencos: $cencos, estados: ["1"] }) {
      nroDoc
      nombres
      cencos
      descCencos
      descArea
      descSeccion
      flagEstado
    }
  }
`

export class AuthWorkerService {
  async getWorkerByDni(dni: string): Promise<BsTrabajador | null> {
    const data = await graphqlQuery<GetTrabajadoresResponse>(GET_TRABAJADOR_QUERY, { dni })
    if (data.getBsTrabajadores && data.getBsTrabajadores.length > 0) {
      return data.getBsTrabajadores[0] ?? null
    }
    return null
  }

  async getWorkersByCencos(cencos: string): Promise<BsTrabajador[]> {
    const data = await graphqlQuery<GetTrabajadoresResponse>(GET_TRABAJADORES_BY_CENCOS_QUERY, {
      cencos,
    })
    return data.getBsTrabajadores || []
  }
}
