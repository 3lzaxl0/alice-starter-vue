import api from '@core/infrastructure/http/axios.instance'

export default {
  login(username: string, password: string) {
    return api.post('/auth/login', { username, password })
  },
}
