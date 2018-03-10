const { PUBLIC_URL } = process.env

export const home = PUBLIC_URL + '/'

export const getPlayerUrl = (playerId: string) => `${home}player/${playerId}`
export const getPlayerGameUrl = (playerId: string, gameId: string) => `${getPlayerUrl(playerId)}/${gameId}`

export const getTeamUrl = (teamId: string) => `${home}team/${teamId}`
export const getTeamGameUrl = (teamId: string, gameId: string) => `${getTeamUrl(teamId)}/${gameId}`
