import * as React from 'react'
import { observer } from 'mobx-react'
import { DateRangePicker } from 'react-dates'
import { SeasonFilterData } from '../models/seasonFilterData'

interface SeasonDataFilterProps {
  data: SeasonFilterData
}

class SeasonDateRangePicker extends React.Component<SeasonDataFilterProps, { focusedInput: string | null }> {
  state = { focusedInput: null }

  render() {
    const { data } = this.props
    const { focusedInput } = this.state

    return (
      <DateRangePicker
        startDate={data.dateRange.startDate}
        startDateId="seasonDataFilterStartDate"
        endDate={data.dateRange.endDate}
        endDateId="seasonDataFilterEndDate"
        onDatesChange={range => data.setDateRange({ startDate: range.startDate!, endDate: range.endDate! })}
        focusedInput={focusedInput}
        onFocusChange={f => this.setState({ focusedInput: f })}
        isOutsideRange={day => !data.isWithinBounds(day)}
      />
    )
  }
}

const SeasonDataFilter = ({ data }: SeasonDataFilterProps) => {
  return (
    <div>
      <SeasonDateRangePicker data={data} />
    </div>
  )
}

export default observer(SeasonDataFilter)
