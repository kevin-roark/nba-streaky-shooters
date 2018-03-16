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
  const chartSideContent = (
    <div>
      <SeasonShootingActiveGame data={data} />
      <SeasonDataFilter data={data.filterData} />
    </div>
  )

  return (
    <div>
      <DataStatus data={data.scores} loading={data.loading} loadError={data.loadError} />

      <TeamSeasonShootingTable data={data} />

      <Pane
        sideWidth={300}
        mainContent={<SeasonShootingChart data={data} title={`${data.season} Team Shooting Accuracy`} />}
        sideContent={chartSideContent}
      />
    </div>
  )
})

export default TeamSeason
