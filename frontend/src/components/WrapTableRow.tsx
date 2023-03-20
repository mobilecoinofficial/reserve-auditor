import React, { useContext, useState } from 'react'
import {
  Box,
  TableRow,
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

import { TAuditedBurn, TAuditedMint, TMint } from '../types'
import { formatEUSD } from '../utils/mcNetworkTokens'
import { getIconFromContactAddress, eUSDTokenAddress } from '../utils/ercTokens'
import { GnosisSafeContext } from '../contexts'
import { abbreviateHash } from '../utils/truncate'
import { Mint } from './Mint'
import CopyableField from './CopyableField'

const borderStyle = '1px solid #cecece'

const StyledTableCell = styled(TableCell)(() => ({
  backgroundColor: 'inherit',
}))

const StyledTableRow = styled(TableRow)(() => ({
  backgroundColor: 'white',
}))

type TableRowInfo = {
  tokenAddr: string
  amount: number
  ethTxHash: string
  blockIndex: number
  type: 'Wrap + Mint' | 'Unwrap + Burn'
  icon: React.ReactNode
}

function extractTableRowInfo(
  rowItem: TAuditedMint | TAuditedBurn
): TableRowInfo | null {
  if ('mint' in rowItem) {
    return {
      tokenAddr: rowItem.deposit.tokenAddr,
      amount: rowItem.mint.amount,
      ethTxHash: rowItem.deposit.ethTxHash,
      blockIndex: rowItem.mint.blockIndex,
      icon: (
        <AddCircleOutlineIcon
          color="success"
          fontSize="small"
          sx={{ marginRight: 1 }}
        />
      ),
      type: 'Wrap + Mint',
    }
  }
  if ('burn' in rowItem) {
    return {
      tokenAddr: rowItem.withdrawal.tokenAddr,
      amount: rowItem.burn.amount,
      ethTxHash: rowItem.withdrawal.ethTxHash,
      blockIndex: rowItem.burn.blockIndex,
      icon: (
        <LocalFireDepartmentIcon
          color="error"
          fontSize="small"
          sx={{ marginRight: 1 }}
        />
      ),
      type: 'Unwrap + Burn',
    }
  }
  console.warn('wrap table item not registering as mint or burn:', rowItem)
  return null
}

export default function WrapTableRow({
  rowItem,
}: {
  rowItem: TAuditedMint | TAuditedBurn
}) {
  const rowInfo = extractTableRowInfo(rowItem)
  const [expanded, setExpanded] = useState(false)

  if (!rowInfo) {
    return null
  }

  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Box display="flex" alignItems="center">
          {rowInfo.icon}
          <Typography>{rowInfo.type}</Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell sx={{ width: 180 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {getIconFromContactAddress(rowInfo.tokenAddr)}
          <Typography sx={{ marginLeft: 1 }}>
            {formatEUSD(rowInfo.amount)}
          </Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell align="right" sx={{ width: 180 }}>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${rowInfo.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {rowInfo.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`${ETHERSCAN_URL}/tx/${rowInfo.ethTxHash}`}
        >
          {abbreviateHash(rowInfo.ethTxHash)}
        </Link>
      </StyledTableCell>
    </StyledTableRow>
  )
}

export function UnAuditedMintTableRow({ mint }: { mint: TMint }) {
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <CopyableField text={mint.recipientB58Addr} />
      </StyledTableCell>
      <StyledTableCell sx={{ width: 180 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {getIconFromContactAddress(eUSDTokenAddress)}
          <Typography sx={{ marginLeft: 1 }}>
            {formatEUSD(mint.amount)}
          </Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell align="right" sx={{ width: 180 }}>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${mint.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {mint.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        <CopyableField text={mint.nonceHex} />
      </StyledTableCell>
    </StyledTableRow>
  )
}
