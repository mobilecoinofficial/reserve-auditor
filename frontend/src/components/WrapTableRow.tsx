import React, { useContext, useState } from 'react'
import {
  Box,
  TableRow as MUITableRow,
  TableCell,
  Typography,
  Link,
  Button,
  IconButton,
  Collapse,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import LayersIcon from '@mui/icons-material/Layers'
import SwipeUpAltIcon from '@mui/icons-material/SwipeUpAlt'
import SwipeDownAltIcon from '@mui/icons-material/SwipeDownAlt'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import moment from 'moment'

import {
  TAuditedBurn,
  TAuditedMint,
  TMint,
  TWithdrawal,
  TUnauditedBurn,
  TUnauditedSafeDeposit,
} from '../types'
import { formatEUSD } from '../utils/mcNetworkTokens'
import { getIconFromContactAddress, eUSDTokenAddress } from '../utils/ercTokens'
import { GnosisSafeContext } from '../contexts'
import { abbreviateHash } from '../utils/truncate'
import { Mint } from './Mint'
import CopyableField from './CopyableField'
import { TTableData } from '../api/hooks/useMintsAndBurns'
import { EUSDIcon } from './icons'

const borderStyle = '1px solid #cecece'

const StyledTableCell = styled(TableCell)(() => ({
  backgroundColor: 'inherit',
}))

const StyledTableRow = styled(MUITableRow)(() => ({
  backgroundColor: 'white',
}))

export default function WrapTableRow({ rowItem }: { rowItem: TTableData }) {
  // audited mint
  if ('mint' in rowItem && 'audited' in rowItem) {
    return (
      <TableRow
        type="Wrap + Mint"
        icon={<LayersIcon color="success" />}
        amount={rowItem.mint.amount}
        timestamp={rowItem.mint.blockTimestamp}
        blockIndex={rowItem.mint.blockIndex}
      />
    )
  }
  // audited burn
  if ('burn' in rowItem && 'audited' in rowItem) {
    return (
      <TableRow
        type="Unwrap + Burn"
        icon={<LocalFireDepartmentIcon color="error" />}
        amount={rowItem.burn.amount}
        timestamp={rowItem.burn.blockTimestamp}
        blockIndex={rowItem.burn.blockIndex}
      />
    )
  }
  // unudited mint
  if ('mintConfigId' in rowItem) {
    return (
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
            <EUSDIcon pxSize={17} />
          </Box>
        }
        amount={rowItem.amount}
        timestamp={rowItem.blockTimestamp}
        blockIndex={rowItem.blockIndex}
      />
    )
  }
  // unaudited burn
  if ('burn' in rowItem) {
    return (
      <TableRow
        type="Burn"
        icon={<DeleteForeverIcon />}
        amount={rowItem.burn.amount}
        timestamp={rowItem.burn.blockTimestamp}
        blockIndex={rowItem.burn.blockIndex}
      />
    )
  }
  // unaudited deposit
  if ('deposit' in rowItem) {
    return (
      <TableRow
        type="Wrap"
        icon={<SwipeDownAltIcon color="info" />}
        amount={rowItem.deposit.amount}
        timestamp={rowItem.deposit.executionDate}
        ethTxHash={rowItem.deposit.ethTxHash}
      />
    )
  }
  // unaudited withdrawal
  if ('executionDate' in rowItem) {
    return (
      <TableRow
        type="Unwrap"
        icon={<SwipeUpAltIcon color="info" />}
        amount={rowItem.amount}
        timestamp={rowItem.executionDate}
        ethTxHash={rowItem.ethTxHash}
      />
    )
  }
  console.warn('table row does not match expected format', rowItem)
  return null
}

type TableRowProps = {
  type: string
  icon: React.ReactNode
  amount: number
  timestamp: string
  blockIndex?: number
  ethTxHash?: string
  additionalRow?: React.ReactNode
  detailsComponent?: React.ReactNode
}

function TableRow({
  type,
  icon,
  amount,
  timestamp,
  blockIndex,
  ethTxHash,
  detailsComponent,
}: TableRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Box display="flex">
          {icon}
          <Typography marginLeft={1}>{type}</Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell align="right">
        <Typography sx={{ fontFamily: 'SohneMono-Buch' }}>
          {formatEUSD(amount)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        {moment(timestamp).format('MMM D, YYYY h:mm A')}
      </StyledTableCell>
      <StyledTableCell
        sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}
        align="right"
      >
        {blockIndex ? (
          <Link
            href={`${BLOCK_EXPLORER_URL}/blocks/${blockIndex}`}
            target="_blank"
            rel="noreferrer"
          >
            {blockIndex}
          </Link>
        ) : (
          '--'
        )}
      </StyledTableCell>
      <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
        {ethTxHash ? (
          <Link
            target="_blank"
            rel="noreferrer"
            href={`${ETHERSCAN_URL}/tx/${ethTxHash}`}
          >
            {abbreviateHash(ethTxHash)}
          </Link>
        ) : (
          '--'
        )}
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        <Button
          onClick={() => setExpanded(!expanded)}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          Details{' '}
          {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </Button>
      </StyledTableCell>
    </StyledTableRow>
  )
}
