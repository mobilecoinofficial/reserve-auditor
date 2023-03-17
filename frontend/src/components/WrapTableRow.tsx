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

const borderStyle = '1px solid #cecece'

const StyledTableCell = styled(TableCell)(() => ({
  backgroundColor: 'inherit',
}))

const StyledTableRow = styled(TableRow)(() => ({
  backgroundColor: 'white',
}))

export default function WrapTableRow({
  rowItem,
}: {
  rowItem: TAuditedMint | TAuditedBurn
}) {
  if ('mint' in rowItem) {
    return <TableRowMint mint={rowItem} />
  }
  if ('burn' in rowItem) {
    return <TableRowBurn burn={rowItem} />
  }
  console.warn('wrap table item not registering as mint or burn:', rowItem)
  return null
}

function TableRowMint({ mint }: { mint: TAuditedMint }) {
  //   const gnosisSafeConfig = useContext(GnosisSafeContext)
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
      <StyledTableCell>
        <Box display="flex" alignItems="center">
          {getIconFromContactAddress(mint.deposit.tokenAddr)}
          <Typography sx={{ marginLeft: 1 }}>
            {formatEUSD(mint.mint.amount)}
          </Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${mint.mint.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {mint.mint.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`${ETHERSCAN_URL}/tx/${mint.deposit.ethTxHash}`}
        >
          {abbreviateHash(mint.deposit.ethTxHash)}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        <Typography color="text.secondary">Details</Typography>
      </StyledTableCell>
    </StyledTableRow>
  )
}

function TableRowBurn({ burn }: { burn: TAuditedBurn }) {
  //   const gnosisSafeConfig = useContext(GnosisSafeContext)
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Box display="flex" alignItems="center">
          <LocalFireDepartmentIcon
            color="error"
            fontSize="small"
            sx={{ marginRight: 1 }}
          />
          <Typography>Unwrap + Burn</Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell>
        <Box display="flex" alignItems="center">
          {getIconFromContactAddress(burn.withdrawal.tokenAddr)}
          <Typography sx={{ marginLeft: 1 }}>
            {formatEUSD(burn.burn.amount)}
          </Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${burn.burn.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {burn.burn.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`${ETHERSCAN_URL}/tx/${burn.withdrawal.ethTxHash}`}
        >
          {abbreviateHash(burn.withdrawal.ethTxHash)}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        <Typography color="text.secondary">Details</Typography>
      </StyledTableCell>
    </StyledTableRow>
  )
}
