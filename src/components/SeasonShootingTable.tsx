import * as React from 'react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import {
  ShootingStat,
  EnhancedShootingBoxScoreStats,
  combineBoxScoreStatsWithShootingData,
  getEnhancedShootingBoxScoreStatsStdDev,
  getEnhancedShootingBoxScoreStatsIQR
} from 'nba-netdata/dist/calc'
import { secondaryContainerStyles, DescriptionExplanation, serif, monospace } from '../layout'
import { pct } from '../util/format'
import { shootingColumns, ShootingColumn, getStatTooltipText } from '../util/shooting'
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

interface SeasonShootingTableProps {
  allStats: EnhancedShootingBoxScoreStats[]
  filteredStats: EnhancedShootingBoxScoreStats[]
}

interface SeasonShootingTableContentProps extends SeasonShootingTableProps {
  filtered: boolean,
  data: SeasonShootingTableData[]
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
    const { data, filtered } = this.props

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

          const datum = data[row.index].filtered
          const value = getStatTooltipText(datum, key)

          this.setTooltip(hovering ? { mouseX, mouseY, key, value, row: row.index } : null)
        }

        return <HoverTableCell onHover={onHover}>{row.value}</HoverTableCell>
      }

      const HoverHeader = row => {
        const onHover = (hovering, mouseX, mouseY) =>
          this.setTooltip(hovering ? { mouseX, mouseY, key, value: title, row: row.index } : null)

        return <HoverTableCell onHover={onHover}>{Header}</HoverTableCell>
      }

      return { Cell, accessor, Header: HoverHeader, id: key }
    })))

    return (
      <Container innerRef={el => this.containerRect = el ? el.getBoundingClientRect() : null}>
        {this.renderCurrentTooltip()}

        <Table {...this.props} data={data} columns={columns} sortable={false} />
        <DescriptionExplanation>
          Hover over cells for more information.
          Stat definitions taken from {' '}
          <a href="https://www.basketball-reference.com/about/glossary.html" target="_blank">Basketball Reference</a>.
        </DescriptionExplanation>
      </Container>
    )
  }
}

export const SeasonShootingTable = (props: SeasonShootingTableProps & TableConfig) => {
  const { allStats, filteredStats } = props

  const allAverage = combineBoxScoreStatsWithShootingData(allStats)
  const allStdDev = getEnhancedShootingBoxScoreStatsStdDev(allStats)
  const allIQR = getEnhancedShootingBoxScoreStatsIQR(allStats)

  const filtered = allStats.length !== filteredStats.length
  const filteredAverage = filtered ? combineBoxScoreStatsWithShootingData(filteredStats) : allAverage
  const filteredStdDev = filtered ? getEnhancedShootingBoxScoreStatsStdDev(filteredStats) : allStdDev
  const filteredIQR = filtered ? getEnhancedShootingBoxScoreStatsIQR(filteredStats) : allIQR

  const data = [
    { all: allAverage, filtered: filteredAverage, label: 'AVG' },
    { all: allStdDev, filtered: filteredStdDev, label: 'STD' },
    { all: allIQR, filtered: filteredIQR, label: 'IQR' }
  ]

  return <SeasonShootingTableContent {...props} data={data} filtered={filtered} />
}

export default SeasonShootingTable
