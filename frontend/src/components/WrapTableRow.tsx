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

const borderStyle = '1px solid #cecece'

const StyledTableCell = styled(TableCell)(() => ({
  backgroundColor: 'inherit',
}))

const StyledTableRow = styled(TableRow)(() => ({
  backgroundColor: 'white',
}))

export default function WrapTableRow({ rowItem }: { rowItem: TTableData }) {
  // audited mint
  if ('mint' in rowItem && 'audited' in rowItem) {
    return <AuditedMintRow mint={rowItem} />
  }
  // audited burn
  if ('burn' in rowItem && 'audited' in rowItem) {
    return <AuditedBurnRow burn={rowItem} />
  }
  // unudited mint
  if ('mintConfigId' in rowItem) {
    return <UnauditedMintRow mint={rowItem} />
  }
  // unaudited burn
  if ('burn' in rowItem) {
    return <UnauditedBurnRow burn={rowItem} />
  }
  // unaudited deposit
  if ('deposit' in rowItem) {
    return <UnauditedDepositRow deposit={rowItem} />
  }
  // unaudited withdrawal
  if ('executionDate' in rowItem) {
    return <UnauditedWithdrawalRow withdrawal={rowItem} />
  }

  console.warn('table row does not match expected format', rowItem)
  return null
}

function AuditedMintRow({ mint }: { mint: TAuditedMint }) {
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Typography>Wrap + Mint</Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography sx={{ fontFamily: 'SohneMono-Buch' }}>
          {formatEUSD(mint.mint.amount)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>{mint.mint.blockTimestamp}</StyledTableCell>
      <StyledTableCell sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${mint.mint.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {mint.mint.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`${ETHERSCAN_URL}/tx/${mint.deposit.ethTxHash}`}
        >
          {abbreviateHash(mint.deposit.ethTxHash)}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        Details
      </StyledTableCell>
    </StyledTableRow>
  )
}

function UnauditedMintRow({ mint }: { mint: TMint }) {
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Typography>Mint</Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography sx={{ fontFamily: 'SohneMono-Buch' }}>
          {formatEUSD(mint.amount)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>{mint.blockTimestamp}</StyledTableCell>
      <StyledTableCell sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${mint.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {mint.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
        --
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        Details
      </StyledTableCell>
    </StyledTableRow>
  )
}

function AuditedBurnRow({ burn }: { burn: TAuditedBurn }) {
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Typography>Unwrap + Burn</Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography sx={{ fontFamily: 'SohneMono-Buch' }}>
          {formatEUSD(burn.burn.amount)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>{burn.burn.blockTimestamp}</StyledTableCell>
      <StyledTableCell sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${burn.burn.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {burn.burn.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`${ETHERSCAN_URL}/tx/${burn.withdrawal.ethTxHash}`}
        >
          {abbreviateHash(burn.withdrawal.ethTxHash)}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        Details
      </StyledTableCell>
    </StyledTableRow>
  )
}

function UnauditedBurnRow({ burn }: { burn: TUnauditedBurn }) {
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Typography>Burn</Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography sx={{ fontFamily: 'SohneMono-Buch' }}>
          {formatEUSD(burn.burn.amount)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>{burn.burn.blockTimestamp}</StyledTableCell>
      <StyledTableCell sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}>
        <Link
          href={`${BLOCK_EXPLORER_URL}/blocks/${burn.burn.blockIndex}`}
          target="_blank"
          rel="noreferrer"
        >
          {burn.burn.blockIndex}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
        --
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        Details
      </StyledTableCell>
    </StyledTableRow>
  )
}

function UnauditedWithdrawalRow({ withdrawal }: { withdrawal: TWithdrawal }) {
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Typography>Unwrap</Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography sx={{ fontFamily: 'SohneMono-Buch' }}>
          {formatEUSD(withdrawal.amount)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>{withdrawal.executionDate}</StyledTableCell>
      <StyledTableCell sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}>
        --
      </StyledTableCell>
      <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`${ETHERSCAN_URL}/tx/${withdrawal.ethTxHash}`}
        >
          {abbreviateHash(withdrawal.ethTxHash)}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        Details
      </StyledTableCell>
    </StyledTableRow>
  )
}

function UnauditedDepositRow({ deposit }: { deposit: TUnauditedSafeDeposit }) {
  return (
    <StyledTableRow hover>
      <StyledTableCell sx={{ borderLeft: borderStyle }}>
        <Typography>Unwrap</Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography sx={{ fontFamily: 'SohneMono-Buch' }}>
          {formatEUSD(deposit.deposit.amount)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>{deposit.deposit.executionDate}</StyledTableCell>
      <StyledTableCell sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}>
        --
      </StyledTableCell>
      <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
        <Link
          target="_blank"
          rel="noreferrer"
          href={`${ETHERSCAN_URL}/tx/${deposit.deposit.ethTxHash}`}
        >
          {abbreviateHash(deposit.deposit.ethTxHash)}
        </Link>
      </StyledTableCell>
      <StyledTableCell sx={{ borderRight: borderStyle }}>
        Details
      </StyledTableCell>
    </StyledTableRow>
  )
}

//   return (
//     <StyledTableRow hover>
//       <StyledTableCell sx={{ borderLeft: borderStyle }}>
//         <Box display="flex" alignItems="center">
//           {rowInfo.icon}
//           <Typography>{rowInfo.type}</Typography>
//         </Box>
//       </StyledTableCell>
//       <StyledTableCell sx={{ width: 180 }}>
//         <Box display="flex" alignItems="center">
//           {getIconFromContactAddress(rowInfo.tokenAddr)}
//           <Typography sx={{ marginLeft: 1, fontFamily: 'SohneMono-Buch' }}>
//             {formatEUSD(rowInfo.amount)}
//           </Typography>
//         </Box>
//       </StyledTableCell>
//       <StyledTableCell sx={{ width: 180, fontFamily: 'SohneMono-Buch' }}>
//         <Link
//           href={`${BLOCK_EXPLORER_URL}/blocks/${rowInfo.blockIndex}`}
//           target="_blank"
//           rel="noreferrer"
//         >
//           {rowInfo.blockIndex}
//         </Link>
//       </StyledTableCell>
//       <StyledTableCell sx={{ fontFamily: 'SohneMono-Buch' }}>
//         <Link
//           target="_blank"
//           rel="noreferrer"
//           href={`${ETHERSCAN_URL}/tx/${rowInfo.ethTxHash}`}
//         >
//           {abbreviateHash(rowInfo.ethTxHash)}
//         </Link>
//       </StyledTableCell>
//     </StyledTableRow>
//   )
// }

// export function UnAuditedMintTableRow({ mint }: { mint: TMint }) {
//   return (
//     <StyledTableRow hover>
//       <StyledTableCell sx={{ width: 180, borderLeft: borderStyle }}>
//         <Box display="flex" alignItems="center">
//           {getIconFromContactAddress(eUSDTokenAddress)}
//           <Typography sx={{ marginLeft: 1 }}>
//             {formatEUSD(mint.amount)}
//           </Typography>
//         </Box>
//       </StyledTableCell>
//       <StyledTableCell sx={{ width: 180, borderRight: borderStyle }}>
//         <Link
//           href={`${BLOCK_EXPLORER_URL}/blocks/${mint.blockIndex}`}
//           target="_blank"
//           rel="noreferrer"
//         >
//           {mint.blockIndex}
//         </Link>
//       </StyledTableCell>
//     </StyledTableRow>
//   )
// }
// export function UnauditedWithdrawalTableRow({
//   withdrawal,
// }: {
//   withdrawal: TWithdrawal
// }) {
//   return (
//     <StyledTableRow hover>
//       <StyledTableCell sx={{ width: 180, borderLeft: borderStyle }}>
//         <Box display="flex" alignItems="center">
//           {getIconFromContactAddress(withdrawal.tokenAddr)}
//           <Typography sx={{ marginLeft: 1 }}>
//             {formatEUSD(withdrawal.amount)}
//           </Typography>
//         </Box>
//       </StyledTableCell>
//       <StyledTableCell sx={{ width: 180, borderRight: borderStyle }}>
//         <Link
//           target="_blank"
//           rel="noreferrer"
//           href={`${ETHERSCAN_URL}/tx/${withdrawal.ethTxHash}`}
//         >
//           {abbreviateHash(withdrawal.ethTxHash)}
//         </Link>
//       </StyledTableCell>
//     </StyledTableRow>
//   )
// }
