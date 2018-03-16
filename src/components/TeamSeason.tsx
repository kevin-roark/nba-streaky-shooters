import * as React from 'react'
import { observer } from 'mobx-react'
import { TeamSeasonDataProps } from '../models/seasonData'
import DataStatus from './DataStatus'
import SeasonDataFilter from './SeasonDataFilter'
import TeamSeasonShootingTable from './TeamSeasonShootingTable'
import SeasonShootingActiveGame from './SeasonShootingActiveGame'
import SeasonShootingChart from './SeasonShootingChart'
import Pane from './Pane'

const TeamSeason = observer(({ data }: TeamSeasonDataProps) => {
  return (
    <div>
      <DataStatus data={data.scores} loading={data.loading} loadError={data.loadError} />

      <Pane
        sideWidth={375}
        marginBottom={0}
        mainContent={<TeamSeasonShootingTable data={data} />}
        sideContent={<SeasonShootingActiveGame data={data} />}
      />

      <Pane
        sideWidth={190}
        mainContent={<SeasonShootingChart data={data} />}
        sideContent={<SeasonDataFilter data={data.filterData} />}
      />
    </div>
  )
})

export default TeamSeason
