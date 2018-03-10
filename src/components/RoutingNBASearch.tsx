import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { getPlayerUrl, getTeamUrl } from '../routes'
import { NBASearch, PartialNBASearchProps, TeamOrPlayer } from './NBASearch'

type RoutingNBASearchProps = RouteComponentProps<any> & PartialNBASearchProps

const RoutingNBASearch = withRouter((props: RoutingNBASearchProps) => {
  const handleSearchRequest = (input: TeamOrPlayer) => {
    let path: string | null = null
    if (input.team) {
      path = getTeamUrl(String(input.team.id))
    } else if (input.player) {
      path = getPlayerUrl(input.player.id)
    }

    if (path) {
      props.history.push(path)
    }
  }

  return <NBASearch big={props.big} handleSearchRequest={handleSearchRequest} />
})

export default RoutingNBASearch
