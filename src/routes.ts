import { Season } from 'nba-netdata/dist/types'

const { PUBLIC_URL } = process.env

export const home = PUBLIC_URL + '/'
export const allPlayers = PUBLIC_URL + '/players-dashboard'
export const allTeams = PUBLIC_URL + '/teams-dashboard'

export const getPlayerRoute = (playerId: string) => `${home}player/${playerId}`
export const getPlayerGameRoute = (playerId: string, gameId?: string) => {
  let route = `${getPlayerRoute(playerId)}/game`
  if (gameId) {
    route = `${route}/${gameId}`
  }
  return route
}

export const getTeamRoute = (teamAbbreviation: string) => `${home}team/${teamAbbreviation}`
export const getTeamGameRoute = (teamAbbreviation: string, gameId?: string) => {
  let route = `${getTeamRoute(teamAbbreviation)}/game`
  if (gameId) {
    route = `${route}/${gameId}`
  }
  return route
}

interface StreakyQueryParams {
  season: Season
}

export function parseQueryParams(search: string): StreakyQueryParams {
  const params = new URLSearchParams(search)

  const season: Season = (params.get('season') as Season) || '2017-18'

  return { season }
}

export function getPlayerId(route: string) {
  const match = route.match(/\/player\/([\w'-]+)\/?/)
  return match ? match[1] : null
}
