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
import DataUsageIcon from '@mui/icons-material/DataUsage'
import moment from 'moment'

import { formatEUSD } from '../utils/mcNetworkTokens'
import {
  getIconFromContactAddress,
  getSymbolFromContactAddress,
} from '../utils/ercTokens'
import { TTableData } from '../api/hooks/useMintsAndBurns'
import { EUSDIcon } from './icons'
import CopyableField from './CopyableField'

const borderStyle = '1px solid #cecece'

const COLUMN_ONE_WIDTH = 215

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
  return <CopyableField text={hash} link={`${ETHERSCAN_URL}/tx/${hash}`} />
}

function MCLink({ blockIndex }: { blockIndex: number }) {
  return (
    <CopyableField
      text={`${blockIndex}`}
      abbreviate={false}
      copy={false}
      link={`${BLOCK_EXPLORER_URL}/blocks/${blockIndex}`}
    />
  )
}

function MCBurnLink({
  blockIndex,
  burnTxo,
}: {
  blockIndex: number
  burnTxo: string
}) {
  return (
    <CopyableField
      text={burnTxo}
      link={`${BLOCK_EXPLORER_URL}/blocks/${blockIndex}`}
    />
  )
}

type DetailsProps = {
  time: string
  link: React.ReactNode
  linkTitle: string
  amount: number
  title: string
  header?: string
}

function DetailsSection({
  time,
  link,
  amount,
  title,
  header,
  linkTitle,
}: DetailsProps) {
  return (
    <Box paddingTop={2} paddingBottom={1} width={COLUMN_ONE_WIDTH * 2}>
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
            {linkTitle}
          </Typography>
          {link}
          <Typography gutterBottom></Typography>
        </li>
        <li>
          <Typography variant="body2" color="textSecondary">
            Confirmed at
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
          link={
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          }
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
                linkTitle="Eth Tx Hash"
              />
              <DetailsSection
                time={rowItem.mint.blockTimestamp}
                amount={rowItem.mint.amount}
                title="eUSD Minted"
                header="Mint"
                link={<MCLink blockIndex={rowItem.mint.blockIndex} />}
                linkTitle="MobileCoin Block Index"
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
          type="Burn + Unwrap"
          icon={<LocalFireDepartmentIcon color="success" />}
          amount={rowItem.burn.amount}
          amountIcon={<EUSDIcon />}
          timestamp={rowItem.burn.blockTimestamp}
          link={
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          }
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Burn"
                time={rowItem.burn.blockTimestamp}
                amount={rowItem.burn.amount}
                title="eUSD Burned"
                link={
                  <MCBurnLink
                    blockIndex={rowItem.burn.blockIndex}
                    burnTxo={rowItem.burn.publicKeyHex}
                  />
                }
                linkTitle="Burn Public Key"
              />
              <DetailsSection
                header="Unwrap"
                time={rowItem.withdrawal.executionDate}
                amount={rowItem.withdrawal.amount}
                title={`${getSymbolFromContactAddress(
                  rowItem.withdrawal.tokenAddr
                )} withdrawn from safe`}
                link={<EthLink hash={rowItem.withdrawal.ethTxHash} />}
                linkTitle="Eth Tx Hash"
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
          type="Wrap"
          error
          icon={<DataUsageIcon sx={{ color: 'error.main' }} />}
        />
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
          link={<MCLink blockIndex={rowItem.blockIndex} />}
          detailsComponent={
            <DetailsSection
              time={rowItem.blockTimestamp}
              link={<MCLink blockIndex={rowItem.blockIndex} />}
              amount={rowItem.amount}
              title="eUSD Minted"
              linkTitle="MobileCoin Block Index"
            />
          }
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
          link={
            <MCBurnLink
              blockIndex={rowItem.burn.blockIndex}
              burnTxo={rowItem.burn.publicKeyHex}
            />
          }
          amountIcon={<EUSDIcon />}
          detailsComponent={
            <DetailsSection
              time={rowItem.burn.blockTimestamp}
              link={
                <MCBurnLink
                  blockIndex={rowItem.burn.blockIndex}
                  burnTxo={rowItem.burn.publicKeyHex}
                />
              }
              amount={rowItem.burn.amount}
              title="eUSD Burned"
              linkTitle="Burn Public Key"
            />
          }
        />
        <TableRow
          type="Unwrap"
          icon={<DataUsageIcon sx={{ color: 'warning.main' }} />}
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
          icon={<DataUsageIcon />}
          amount={rowItem.deposit.amount}
          amountIcon={getIconFromContactAddress(rowItem.deposit.tokenAddr)}
          timestamp={rowItem.deposit.executionDate}
          link={<EthLink hash={rowItem.deposit.ethTxHash} />}
          detailsComponent={
            <DetailsSection
              time={rowItem.deposit.executionDate}
              link={<EthLink hash={rowItem.deposit.ethTxHash} />}
              amount={rowItem.deposit.amount}
              title="eUSD Burned"
              linkTitle="Eth Tx Hash"
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
          type="Burn"
          error
          icon={<LocalFireDepartmentIcon sx={{ color: 'error.main' }} />}
        />
        <TableRow
          type="Unwrap"
          icon={<DataUsageIcon />}
          amount={rowItem.amount}
          amountIcon={getIconFromContactAddress(rowItem.tokenAddr)}
          timestamp={rowItem.executionDate}
          link={<EthLink hash={rowItem.ethTxHash} />}
          detailsComponent={
            <DetailsSection
              time={rowItem.executionDate}
              link={<EthLink hash={rowItem.ethTxHash} />}
              amount={rowItem.amount}
              title="eUSD Withdrawn"
              linkTitle="Eth Tx Hash"
            />
          }
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
  link?: React.ReactNode
  error?: boolean
}

function TableRow({
  type,
  icon,
  amount,
  amountIcon,
  timestamp,
  detailsComponent,
  error,
  link,
}: TableRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <StyledTableRow hover onClick={() => setExpanded(!expanded)}>
        <StyledTableCell
          sx={{
            borderLeft: borderStyle,
            minWidth: COLUMN_ONE_WIDTH,
            width: COLUMN_ONE_WIDTH,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            {icon}
            {type}
          </Stack>
        </StyledTableCell>
        <StyledTableCell
          sx={{
            minWidth: COLUMN_ONE_WIDTH,
            width: COLUMN_ONE_WIDTH,
          }}
        >
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
          ) : error ? (
            <Box color="error.main">Missing...</Box>
          ) : (
            <Box color="warning.main">Pending...</Box>
          )}
        </StyledTableCell>
        <StyledTableCell>{link ?? '--'}</StyledTableCell>
        <StyledTableCell sx={{ borderRight: borderStyle }}>
          {detailsComponent ? (
            <Button sx={{ textTransform: 'none', color: 'text.secondary' }}>
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
