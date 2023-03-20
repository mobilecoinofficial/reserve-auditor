import React, { useContext } from 'react'
import { Box, TableRow, TableCell, Typography, Link } from '@mui/material'
import { styled } from '@mui/material/styles'

import { TAuditedBurn, TAuditedMint } from '../types'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { formatEUSD } from '../utils/mcNetworkTokens'
import { getIconFromContactAddress } from '../utils/ercTokens'
import { GnosisSafeContext } from '../contexts'
import { abbreviateHash } from '../utils/truncate'
import { Mint } from './Mint'

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
      type: 'Wrap + Mint',
    }
  }
  if ('burn' in rowItem) {
    return {
      tokenAddr: rowItem.withdrawal.tokenAddr,
      amount: rowItem.burn.amount,
      ethTxHash: rowItem.withdrawal.ethTxHash,
      blockIndex: rowItem.burn.blockIndex,
      type: 'Wrap + Mint',
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

  if (!rowInfo) {
    return null
  }

  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Box display="flex" alignItems="center">
          <AddCircleOutlineIcon
            color="success"
            fontSize="small"
            sx={{ marginRight: 1 }}
          />
          <Typography>Wrap + Mint</Typography>
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
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        <Typography color="text.secondary">Details</Typography>
      </StyledTableCell>
    </StyledTableRow>
  )
}
