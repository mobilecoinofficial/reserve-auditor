import React, { useContext, useState } from 'react'
import {
  Box,
  TableRow as MUITableRow,
  TableCell,
  Typography,
  Link,
  Button,
  Table,
  IconButton,
  Collapse,
  TableBody,
  TableContainer,
  Stack,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
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
import { Details } from '@mui/icons-material'

const borderStyle = '1px solid #cecece'

const StyledTableCell = styled(TableCell)(() => ({
  backgroundColor: 'inherit',
  border: 'none',
}))

const StyledTableRow = styled(MUITableRow)(() => ({
  backgroundColor: 'white',
}))

const SpacerRow = styled(MUITableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: 'none',
}))

const dateFormat = 'MMM D, YYYY'
const preciseDateFormat = 'MMM D, YYYY h:mm A'

type DetailsProps = {
  time: string
  link: React.ReactNode
  amount: number
  title: string
}

function DetailsSection({ time, link, amount, title }: DetailsProps) {
  return (
    <Box>
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
      <Typography gutterBottom>{formatEUSD(amount)}</Typography>
      <Typography variant="body2" color="textSecondary">
        Blockchain Link
      </Typography>
      <Typography gutterBottom>{link}</Typography>
      <Typography variant="body2" color="textSecondary">
        Block confirmation time
      </Typography>
      <Typography>{moment(time).format(preciseDateFormat)}</Typography>
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
          amountIcon={<EUSDIcon pxSize={17} />}
          timestamp={rowItem.mint.blockTimestamp}
          detailsComponent={
            <Box>
              <Box sx={{ marginBottom: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  Funds desposited into safe
                </Typography>
                <Typography gutterBottom>
                  {formatEUSD(rowItem.deposit.amount)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Deposit block confirmation time
                </Typography>
                <Typography gutterBottom>
                  {moment(rowItem.deposit.executionDate).format(dateFormat)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  eUSD Minted
                </Typography>
                <Typography gutterBottom>
                  {formatEUSD(rowItem.mint.amount)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Mint block confirmation time
                </Typography>
                <Typography gutterBottom>
                  {moment(rowItem.mint.blockTimestamp).format(dateFormat)}
                </Typography>
              </Box>
            </Box>
          }
        />
        <SpacerRow>
          <TableCell colSpan={5} sx={{ borderTop: borderStyle }}></TableCell>
        </SpacerRow>
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
          amountIcon={<EUSDIcon pxSize={17} />}
          timestamp={rowItem.burn.blockTimestamp}
        />
        <SpacerRow>
          <TableCell colSpan={5} sx={{ borderTop: borderStyle }}></TableCell>
        </SpacerRow>
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
              <EUSDIcon pxSize={17} />
            </Box>
          }
          amount={rowItem.amount}
          amountIcon={<EUSDIcon pxSize={17} />}
          timestamp={rowItem.blockTimestamp}
          hash={
            <Link
              href={`${BLOCK_EXPLORER_URL}/blocks/${rowItem.blockIndex}`}
              target="_blank"
              rel="noreferrer"
            >
              {rowItem.blockIndex}
            </Link>
          }
          detailsComponent={
            <DetailsSection
              time={rowItem.blockTimestamp}
              link={
                <Link
                  href={`${BLOCK_EXPLORER_URL}/blocks/${rowItem.blockIndex}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {rowItem.blockIndex}
                </Link>
              }
              amount={rowItem.amount}
              title="eUSD Minted"
            />
          }
        />
        <TableRow type="Wrap" icon={<SwipeDownAltIcon color="info" />} />
        <SpacerRow>
          <TableCell colSpan={5} sx={{ borderTop: borderStyle }}></TableCell>
        </SpacerRow>
      </>
    )
  }
  // unaudited burn
  if ('burn' in rowItem) {
    return (
      <>
        <TableRow
          type="Burn"
          icon={<DeleteForeverIcon />}
          amount={rowItem.burn.amount}
          timestamp={rowItem.burn.blockTimestamp}
          amountIcon={<EUSDIcon pxSize={17} />}
        />
        <SpacerRow>
          <TableCell colSpan={5} sx={{ borderTop: borderStyle }}></TableCell>
        </SpacerRow>
      </>
    )
  }
  // unaudited deposit
  if ('deposit' in rowItem) {
    return (
      <>
        <TableRow
          type="Wrap"
          icon={<SwipeDownAltIcon color="info" />}
          amount={rowItem.deposit.amount}
          amountIcon={getIconFromContactAddress(rowItem.deposit.tokenAddr)}
          timestamp={rowItem.deposit.executionDate}
        />
        <SpacerRow>
          <TableCell colSpan={5} sx={{ borderTop: borderStyle }}></TableCell>
        </SpacerRow>
      </>
    )
  }
  // unaudited withdrawal
  if ('executionDate' in rowItem) {
    return (
      <>
        <TableRow
          type="Unwrap"
          icon={<SwipeUpAltIcon color="info" />}
          amount={rowItem.amount}
          amountIcon={getIconFromContactAddress(rowItem.tokenAddr)}
          timestamp={rowItem.executionDate}
        />
        <SpacerRow>
          <TableCell colSpan={5} sx={{ borderTop: borderStyle }}></TableCell>
        </SpacerRow>
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
  hash?: React.ReactNode
  detailsComponent?: React.ReactNode
}

function TableRow({
  type,
  icon,
  amount,
  amountIcon,
  timestamp,
  hash,
  detailsComponent,
}: TableRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <StyledTableRow hover>
        <StyledTableCell>
          <Box display="flex">
            {icon}
            <Typography marginLeft={1}>{type}</Typography>
          </Box>
        </StyledTableCell>
        <StyledTableCell>
          {amount ? (
            <Stack direction="row" alignItems="center" gap={1}>
              {amountIcon}
              <Typography>{formatEUSD(amount)}</Typography>
            </Stack>
          ) : (
            '--'
          )}
        </StyledTableCell>
        <StyledTableCell>
          {timestamp ? (
            <Typography>{moment(timestamp).format(dateFormat)}</Typography>
          ) : (
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography display="inline" color="warning.main">
                Pending...
              </Typography>
              <AccessTimeIcon
                display="inline"
                color="warning"
                fontSize="small"
              />
            </Stack>
          )}
        </StyledTableCell>
        <StyledTableCell>{hash ?? '--'}</StyledTableCell>
        <StyledTableCell>
          {detailsComponent ? (
            <Button
              onClick={() => setExpanded(!expanded)}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Details{' '}
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>
          ) : (
            <Box height={36} />
          )}
        </StyledTableCell>
      </StyledTableRow>
      <StyledTableRow>
        <TableCell colSpan={6} sx={{ paddingY: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {detailsComponent}
          </Collapse>
        </TableCell>
      </StyledTableRow>
    </>
  )
}

{
  /* <StyledTableRow>
<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
  <Collapse in={expanded} timeout="auto" unmountOnExit>
    <Box sx={{ margin: 1 }}>{detailsComponent}</Box>
  </Collapse>
</TableCell>
</StyledTableRow> */
}

{
  /* <StyledTableCell
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
</StyledTableCell> */
}
