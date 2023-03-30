import React, { useState } from 'react'
import {
  Box,
  TableRow as MUITableRow,
  TableCell,
  Typography,
  Link,
  Button,
  Collapse,
  Stack,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import LayersIcon from '@mui/icons-material/Layers'
import SwipeUpAltIcon from '@mui/icons-material/SwipeUpAlt'
import SwipeDownAltIcon from '@mui/icons-material/SwipeDownAlt'
import moment from 'moment'

import { formatEUSD } from '../utils/mcNetworkTokens'
import {
  getIconFromContactAddress,
  getSymbolFromContactAddress,
} from '../utils/ercTokens'
import { abbreviateHash } from '../utils/truncate'
import { TTableData } from '../api/hooks/useMintsAndBurns'
import { EUSDIcon } from './icons'

const borderStyle = '1px solid #cecece'

const StyledTableCell = styled(TableCell)(() => ({
  backgroundColor: 'inherit',
  border: 'none',
}))

const StyledTableRow = styled(MUITableRow)(() => ({
  backgroundColor: 'white',
}))

const SpacerRow = () => (
  <MUITableRow
    sx={{ backgroundColor: 'theme.palette.background.default', border: 'none' }}
  >
    <TableCell colSpan={5}></TableCell>
  </MUITableRow>
)

const dateFormat = 'MMM D, YYYY'
const preciseDateFormat = 'MMM D, YYYY h:mm A'

function EthLink({ hash }: { hash: string }) {
  return (
    <Link target="_blank" rel="noreferrer" href={`${ETHERSCAN_URL}/tx/${hash}`}>
      <Typography>{abbreviateHash(hash)}</Typography>
    </Link>
  )
}

function MCLink({ blockIndex }: { blockIndex: number }) {
  return (
    <Link
      href={`${BLOCK_EXPLORER_URL}/blocks/${blockIndex}`}
      target="_blank"
      rel="noreferrer"
    >
      <Typography>{blockIndex}</Typography>
    </Link>
  )
}

type DetailsProps = {
  time: string
  link: React.ReactNode
  amount: number
  title?: string
  header?: string
}

function DetailsSection({ time, link, amount, title, header }: DetailsProps) {
  return (
    <Box paddingTop={2} paddingBottom={1} paddingRight={6}>
      <Typography variant="subtitle1">{header}</Typography>
      <ul style={{ paddingLeft: '16px' }}>
        <li>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Typography gutterBottom>{formatEUSD(amount)}</Typography>
        </li>
        <li>
          <Typography variant="body2" color="textSecondary">
            Blockchain Link
          </Typography>
          <Typography gutterBottom>{link}</Typography>
        </li>
        <li>
          <Typography variant="body2" color="textSecondary">
            Block confirmation time
          </Typography>
          <Typography>{moment(time).format(preciseDateFormat)}</Typography>
        </li>
      </ul>
    </Box>
  )
}

export default function WrapTableRow({ rowItem }: { rowItem: TTableData }) {
  // audited mint
  if ('mint' in rowItem && 'audited' in rowItem) {
    return (
      <>
        <TableRow
          type="Wrap + Mint"
          icon={<LayersIcon color="success" />}
          amount={rowItem.mint.amount}
          amountIcon={<EUSDIcon />}
          timestamp={rowItem.mint.blockTimestamp}
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Wrap"
                time={rowItem.deposit.executionDate}
                amount={rowItem.deposit.amount}
                title={`${getSymbolFromContactAddress(
                  rowItem.deposit.tokenAddr
                )} desposited into safe`}
                link={<EthLink hash={rowItem.deposit.ethTxHash} />}
              />
              <DetailsSection
                time={rowItem.mint.blockTimestamp}
                amount={rowItem.mint.amount}
                title="eUSD Minted"
                header="Mint"
                link={<MCLink blockIndex={rowItem.mint.blockIndex} />}
              />
            </Box>
          }
        />
        <SpacerRow />
      </>
    )
  }
  // audited burn
  if ('burn' in rowItem && 'audited' in rowItem) {
    return (
      <>
        <TableRow
          type="Unwrap + Burn"
          icon={<LocalFireDepartmentIcon color="error" />}
          amount={rowItem.burn.amount}
          amountIcon={<EUSDIcon />}
          timestamp={rowItem.burn.blockTimestamp}
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Unwrap"
                time={rowItem.withdrawal.executionDate}
                amount={rowItem.withdrawal.amount}
                title={`${getSymbolFromContactAddress(
                  rowItem.withdrawal.tokenAddr
                )} withdrawn from safe`}
                link={<EthLink hash={rowItem.withdrawal.ethTxHash} />}
              />
              <DetailsSection
                header="Burn"
                time={rowItem.burn.blockTimestamp}
                amount={rowItem.burn.amount}
                title="eUSD Burned"
                link={<MCLink blockIndex={rowItem.burn.blockIndex} />}
              />
            </Box>
          }
        />
        <SpacerRow />
      </>
    )
  }
  // unudited mint
  if ('mintConfigId' in rowItem) {
    return (
      <>
        <TableRow
          type="Mint"
          icon={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={24}
              height={24}
            >
              <EUSDIcon />
            </Box>
          }
          amount={rowItem.amount}
          amountIcon={<EUSDIcon />}
          timestamp={rowItem.blockTimestamp}
          detailsComponent={
            <DetailsSection
              time={rowItem.blockTimestamp}
              link={<MCLink blockIndex={rowItem.blockIndex} />}
              amount={rowItem.amount}
              title="eUSD Minted"
            />
          }
        />
        <TableRow
          type="Wrap"
          icon={<SwipeDownAltIcon sx={{ color: 'warning.main' }} />}
        />
        <SpacerRow />
      </>
    )
  }
  // unaudited burn
  if ('burn' in rowItem) {
    return (
      <>
        <TableRow
          type="Burn"
          icon={<LocalFireDepartmentIcon />}
          amount={rowItem.burn.amount}
          timestamp={rowItem.burn.blockTimestamp}
          amountIcon={<EUSDIcon />}
          detailsComponent={
            <DetailsSection
              time={rowItem.burn.blockTimestamp}
              link={<MCLink blockIndex={rowItem.burn.blockIndex} />}
              amount={rowItem.burn.amount}
              title="eUSD Burned"
            />
          }
        />
        <TableRow
          type="Unwrap"
          icon={<SwipeUpAltIcon sx={{ color: 'warning.main' }} />}
        />
        <SpacerRow />
      </>
    )
  }
  // unaudited deposit
  if ('deposit' in rowItem) {
    return (
      <>
        <TableRow
          type="Wrap"
          icon={<SwipeDownAltIcon />}
          amount={rowItem.deposit.amount}
          amountIcon={getIconFromContactAddress(rowItem.deposit.tokenAddr)}
          timestamp={rowItem.deposit.executionDate}
          detailsComponent={
            <DetailsSection
              time={rowItem.deposit.executionDate}
              link={<EthLink hash={rowItem.deposit.ethTxHash} />}
              amount={rowItem.deposit.amount}
              title="eUSD Burned"
            />
          }
        />
        <TableRow
          type="Mint"
          icon={<LayersIcon sx={{ color: 'warning.main' }} />}
        />
        <SpacerRow />
      </>
    )
  }
  // unaudited withdrawal
  if ('executionDate' in rowItem) {
    return (
      <>
        <TableRow
          type="Unwrap"
          icon={<SwipeUpAltIcon />}
          amount={rowItem.amount}
          amountIcon={getIconFromContactAddress(rowItem.tokenAddr)}
          timestamp={rowItem.executionDate}
          detailsComponent={
            <DetailsSection
              time={rowItem.executionDate}
              link={<EthLink hash={rowItem.ethTxHash} />}
              amount={rowItem.amount}
              title="eUSD Withdrawn"
            />
          }
        />
        <TableRow
          type="Burn"
          icon={<LocalFireDepartmentIcon sx={{ color: 'warning.main' }} />}
        />
        <SpacerRow />
      </>
    )
  }
  console.warn('table row does not match expected format', rowItem)
  return null
}

type TableRowProps = {
  type: string
  icon: React.ReactNode
  amount?: number
  amountIcon?: React.ReactNode
  timestamp?: string
  detailsComponent?: React.ReactNode
}

function TableRow({
  type,
  icon,
  amount,
  amountIcon,
  timestamp,
  detailsComponent,
}: TableRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <StyledTableRow hover>
        <StyledTableCell sx={{ borderLeft: borderStyle }}>
          <Stack direction="row" alignItems="center" gap={1}>
            {icon}
            {type}
          </Stack>
        </StyledTableCell>
        <StyledTableCell>
          {amount ? (
            <Stack direction="row" alignItems="center" gap={1}>
              {amountIcon}
              {formatEUSD(amount)}
            </Stack>
          ) : (
            '--'
          )}
        </StyledTableCell>
        <StyledTableCell>
          {timestamp ? (
            moment(timestamp).format(dateFormat)
          ) : (
            <Box color="warning.main">Pending...</Box>
          )}
        </StyledTableCell>
        <StyledTableCell sx={{ borderRight: borderStyle }}>
          {detailsComponent ? (
            <Button
              onClick={() => setExpanded(!expanded)}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Details
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>
          ) : (
            <Box height={36} />
          )}
        </StyledTableCell>
      </StyledTableRow>
      <StyledTableRow>
        <TableCell
          colSpan={6}
          sx={{
            paddingY: 0,
            borderLeft: borderStyle,
            borderRight: borderStyle,
          }}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {detailsComponent}
          </Collapse>
        </TableCell>
      </StyledTableRow>
    </>
  )
}
