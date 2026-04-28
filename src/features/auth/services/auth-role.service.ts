import { graphqlQuery } from '@core/infrastructure/http/graphql.client'
import type { AppRole } from '../domain/models/user.model'

interface GetAppRolesResponse {
  getAppRolesByUser: AppRole[]
}

const GET_ROLES_QUERY = `
  query GetAppRolesByUser($userId: String!, $appCode: String!) {
    getAppRolesByUser(userId: $userId, appCode: $appCode) {
        roleId
        roleName
        roleType
        domainCode
    }
  }
`

export class AuthRoleService {
  /**
   * Fetches roles for the user in the context of the given application.
   * Useful when jumping from another app where a valid token exists but app roles are absent.
   */
  async getAppRolesByUser(userId: string, appCode: string): Promise<AppRole[]> {
    const data = await graphqlQuery<GetAppRolesResponse>(GET_ROLES_QUERY, {
      userId,
      appCode,
    })
    return data.getAppRolesByUser || []
  }
}
