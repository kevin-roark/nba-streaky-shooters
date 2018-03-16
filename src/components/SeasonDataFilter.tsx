import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { DateRangePicker } from 'react-dates'
import { Season } from 'nba-netdata/dist/types'
import { SeasonFilterData } from '../models/seasonFilterData'
import { secondaryContainerStyles, monospace, DescriptionExplanation } from '../layout'
import ShootingDataLegend from './ShootingDataLegend'
import Select from './Select'

const Container = styled('div')``

const SubContainer = styled('div')`
  ${secondaryContainerStyles};
  padding: 10px;
`

const SeasonSelectorContainer = styled('div')`
  margin-bottom: 15px;
`

interface SeasonDataFilterProps {
  data: SeasonFilterData
}

@observer
class SeasonDateRangePicker extends React.Component<SeasonDataFilterProps, { focusedInput: string | null }> {
  state = { focusedInput: null }

  render() {
    const { data } = this.props
    const { focusedInput } = this.state

    const drpProps = {
      small: true,
      displayFormat: 'MM/DD/YY',
      customArrowIcon: '→',
      startDate: data.dateRange.startDate,
      startDateId: 'seasonDataFilterStartDate',
      endDate: data.dateRange.endDate,
      endDateId: 'seasonDataFilterEndDate',
      onDatesChange: range => data.setDateRange({ startDate: range.startDate!, endDate: range.endDate! }),
      focusedInput: focusedInput,
      onFocusChange: f => this.setState({ focusedInput: f }),
      isOutsideRange: day => !data.isWithinBounds(day)
    }

    return <DateRangePicker {...drpProps} />
  }
}

@observer
class SeasonSelector extends React.Component<SeasonDataFilterProps, {}> {
  render() {
    const { data } = this.props

    const allSeasonValue = 'all'
    const value = !data.season ? allSeasonValue : data.season

    const options = SeasonFilterData.allSeasons.map(s => ({ value: s, label: `${s} Season` }))

    return (
      <SeasonSelectorContainer>
        <Select
          name="season"
          value={value}
          onChange={s => data.setSeason(s.value === allSeasonValue ? null : s.value as Season)}
          options={options}
        />
      </SeasonSelectorContainer>
    )
  }
}

const SeasonDataFilter = ({ data }: SeasonDataFilterProps) => {
  return (
    <Container>
      <ShootingDataLegend filterData={data.shootingFilter} />

      <SubContainer>
        <SeasonSelector data={data} />
        <SeasonDateRangePicker data={data} />
        <DescriptionExplanation>
          Select season or range of games.
        </DescriptionExplanation>
      </SubContainer>
    </Container>
  )
}

export default observer(SeasonDataFilter)
