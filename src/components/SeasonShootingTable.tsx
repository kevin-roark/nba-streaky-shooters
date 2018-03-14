import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import {
  ShootingStat,
  EnhancedShootingBoxScoreStats,
  getEnhancedShootingBoxScoreStatsStdDev,
  getEnhancedShootingBoxScoreStatsIQR
} from 'nba-netdata/dist/calc'
import { secondaryContainerStyles, DescriptionExplanation, serif, monospace } from '../layout'
import { pct } from '../util/format'
import { shootingColumns, ShootingColumn, getStatMadeAttemptedText } from '../util/shooting'
import { PlayerSeasonDataProps } from '../models/seasonData'
import { Table, TableColumn, TableConfig } from './table/Table'
import { HoverTableCell } from './table/TableCell'
import NumberDiff from './NumberDiff'
import HoverContainer from './HoverContainer'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding-bottom: 10px;
`

const ToolTip = styled('div')`
  text-align: center;
  font-size: 13px;
  font-family: ${serif};

  &.data {
    font-size: 16px;
    font-family: ${monospace};
  }
`

interface SeasonShootingTableData {
  all: EnhancedShootingBoxScoreStats,
  filtered: EnhancedShootingBoxScoreStats,
  label: string
}

interface SeasonShootingTableProps extends PlayerSeasonDataProps {}

interface SeasonShootingTableContentProps extends SeasonShootingTableProps {
  filtered: boolean,
  tableData: SeasonShootingTableData[]
}

interface SeasonShootingTableTooltip {
  mouseX: number,
  mouseY: number,
  key: 'label' | ShootingStat,
  row: number,
  width?: number,
  value?: React.ReactNode
}

interface SeasonShootingtableContentState {
  tooltip: SeasonShootingTableTooltip | null
}

@observer
class SeasonShootingTableContent extends React.Component<SeasonShootingTableContentProps, SeasonShootingtableContentState> {
  containerRect: ClientRect | DOMRect | null

  constructor(props: SeasonShootingTableContentProps) {
    super(props)
    this.state = { tooltip: null }
  }

  setTooltip(tooltip: SeasonShootingTableTooltip | null) {
    this.setState({ tooltip })
  }

  renderCurrentTooltip() {
    const { tooltip } = this.state
    if (!tooltip) {
      return null
    }

    const { key, value, row, width = 150 } = tooltip
    if (!value) {
      return null
    }

    let mouseY = tooltip.mouseY
    if (this.containerRect && key !== 'label') {
      mouseY = this.containerRect.top - 40
    }

    return (
      <HoverContainer {...tooltip} mouseY={mouseY} width={width} selfManaged={false}>
        <ToolTip className={cx({ data: key !== 'label' && row === 0 })}>{value}</ToolTip>
      </HoverContainer>
    )
  }

  renderLabelTooltip(value: string) {
    switch (value) {
      case 'STD':
        return 'Standard Deviation for selected range of games, with per-game data points.'
      case 'IQR':
        return 'Interquartile Range for selected range of games, with per-game data points.'
      case 'AVG':
      default:
        return 'Total for selected range of games.'
    }
  }

  render() {
    const { tableData, filtered } = this.props

    const lc: TableColumn<SeasonShootingTableData> = {
      Header: '',
      accessor: 'label',
      width: 60,
      Cell: row => {
        const onHover = (hovering, mouseX, mouseY) => {
          const value = this.renderLabelTooltip(row.value)
          this.setTooltip(hovering ? { mouseX, mouseY, key: 'label', value, width: 220, row: row.index } : null)
        }

        return <HoverTableCell align="center" onHover={onHover}>{row.value}</HoverTableCell>
      }
    }

    const columns = [lc].concat(shootingColumns.map(((c: ShootingColumn): TableColumn<SeasonShootingTableData> => {
      const { Header, key, title } = c

      const accessor = (d: SeasonShootingTableData) => {
        const v = d.filtered[key]
        if (!filtered) {
          return pct(v)
        }

        const av = d.all[key]
        return (
          <span>
            {pct(v)} <span style={{ opacity: 0.5 }}>→</span> <NumberDiff diff={v - av} formatter={pct} />
          </span>
        )
      }

      const Cell = row => {
        const onHover = (hovering, mouseX, mouseY) => {
          if (row.index !== 0) {
            return
          }

          const datum = tableData[row.index].filtered
          const value = getStatMadeAttemptedText(datum, key)

          this.setTooltip(hovering ? { mouseX, mouseY, key, value, row: row.index } : null)
        }

        return <HoverTableCell onHover={onHover}>{row.value}</HoverTableCell>
      }

      const HoverHeader = row => {
        const onHover = (hovering, mouseX, mouseY) =>
          this.setTooltip(hovering ? { mouseX, mouseY, key, value: title, row: row.index } : null)

        return <HoverTableCell align="center" onHover={onHover}>{Header}</HoverTableCell>
      }

      return { Cell, accessor, Header: HoverHeader, id: key }
    })))

    return (
      <Container innerRef={el => this.containerRect = el ? el.getBoundingClientRect() : null}>
        {this.renderCurrentTooltip()}

        <Table {...this.props} data={tableData} columns={columns} sortable={false} />
        <DescriptionExplanation>
          {filtered && 'Colored values are differences between stats over current games and season average. '}
          Hover over cells for more information.
          Stat definitions taken from {' '}
          <a href="https://www.basketball-reference.com/about/glossary.html" target="_blank">Basketball Reference</a>.
        </DescriptionExplanation>
      </Container>
    )
  }
}

export const SeasonShootingTable = observer((props: SeasonShootingTableProps & TableConfig) => {
  const { data } = props
  const { allStats, filteredStats, filtered, allAverageStats, filteredAverageStats } = data

  const allStdDev = getEnhancedShootingBoxScoreStatsStdDev(allStats)
  const allIQR = getEnhancedShootingBoxScoreStatsIQR(allStats)

  const filteredStdDev = filtered ? getEnhancedShootingBoxScoreStatsStdDev(filteredStats) : allStdDev
  const filteredIQR = filtered ? getEnhancedShootingBoxScoreStatsIQR(filteredStats) : allIQR

  const tableData = [
    { all: allAverageStats, filtered: filteredAverageStats, label: 'AVG' },
    { all: allStdDev, filtered: filteredStdDev, label: 'STD' },
    { all: allIQR, filtered: filteredIQR, label: 'IQR' }
  ]

  return <SeasonShootingTableContent {...props} tableData={tableData} filtered={filtered} />
})

export default SeasonShootingTable
