import React, { useState } from 'react'
import {
  Box,
  TableRow as MUITableRow,
  TableCell,
  Typography,
  Button,
  Collapse,
  Stack,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import PendingIcon from '@mui/icons-material/Pending'
import DoneIcon from '@mui/icons-material/Done'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import moment from 'moment'

import { formatEUSD } from '../utils/mcNetworkTokens'
import {
  getIconFromContactAddress,
  getSymbolFromContactAddress,
} from '../utils/ercTokens'
import { TTableData } from '../api/hooks/useTableData'
import { EUSDIcon, EUSDWrapIcon, WrapMintIcon } from './icons'
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

const BurnIcon = ({ color = 'icon.burnTx' }: { color?: string }) => {
  return <LocalFireDepartmentIcon sx={{ color }} />
}

const AlertIcon = ({ color = 'primary.light' }: { color?: string }) => {
  return <ErrorOutlineIcon sx={{ color }} />
}

const dateFormat = 'MMM D, YYYY'
const preciseDateFormat = 'MMM D, YYYY h:mm A'

function EthLink({ hash }: { hash: string }) {
  return (
    <CopyableField
      text={hash}
      showFullValueTip
      link={`${ETHERSCAN_URL}/tx/${hash}`}
    />
  )
}

function MCLink({ blockIndex }: { blockIndex: number }) {
  return (
    <CopyableField
      text={`${blockIndex}`}
      abbreviate={false}
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
      showFullValueTip
    />
  )
}

function CompletedField() {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <DoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      <Typography color="textSecondary">Completed</Typography>
    </Stack>
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

type InfoProps = {
  icon?: React.ReactNode
  header?: string
  text: string
}

function InfoSection({ icon, header, text }: InfoProps) {
  return (
    <Box paddingTop={2} paddingBottom={1} width={COLUMN_ONE_WIDTH * 2}>
      <Typography variant="subtitle1">
        <Stack direction="row" alignItems="center" gap={1}>
          {icon}
          {header}
        </Stack>
      </Typography>
      <ul style={{ paddingLeft: '4px' }}>
        <li style={{ listStyleType: 'none' }}>
          <Typography variant="body2" color="textSecondary">
            {text}
          </Typography>
        </li>
      </ul>
    </Box>
  )
}

export default function DataTableRow({ rowItem }: { rowItem: TTableData }) {
  // audited mint
  if ('mint' in rowItem && 'audited' in rowItem) {
    return (
      <>
        <TableRow
          type="Wrap + Mint"
          icon={<WrapMintIcon />}
          amount={rowItem.mint.amount}
          amountIcon={<EUSDIcon />}
          timestamp={rowItem.mint.blockTimestamp}
          link={<CompletedField />}
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Wrap"
                time={rowItem.deposit.executionDate}
                amount={rowItem.deposit.amount}
                title={`${getSymbolFromContactAddress(
                  rowItem.deposit.tokenAddr
                )} received by custodian multisig`}
                link={<EthLink hash={rowItem.deposit.ethTxHash} />}
                linkTitle="Eth Tx Hash"
              />
              <DetailsSection
                time={rowItem.mint.blockTimestamp}
                amount={rowItem.mint.amount}
                title="eUSD minted"
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
          icon={<BurnIcon />}
          amount={rowItem.burn.amount}
          amountIcon={<EUSDIcon />}
          timestamp={rowItem.burn.blockTimestamp}
          link={<CompletedField />}
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Burn"
                time={rowItem.burn.blockTimestamp}
                amount={rowItem.burn.amount}
                title="eUSD burned"
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
                )} sent from custodian multisig`}
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
  // unaudited mint
  if ('mintConfigId' in rowItem) {
    return (
      <>
        <TableRow
          type="Minted eUSD"
          icon={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={24}
              height={24}
            >
              <AlertIcon />
            </Box>
          }
          amount={rowItem.amount}
          amountIcon={<EUSDIcon />}
          timestamp={rowItem.blockTimestamp}
          link={<MCLink blockIndex={rowItem.blockIndex} />}
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Mint"
                time={rowItem.blockTimestamp}
                link={<MCLink blockIndex={rowItem.blockIndex} />}
                amount={rowItem.amount}
                title="eUSD Minted"
                linkTitle="MobileCoin Block Index"
              />
              <InfoSection
                icon={<AlertIcon />}
                header="Alert"
                text="A corresponding deposit of funds to the custodian multisig was not identified."
              />
            </Box>
          }
        />
        <SpacerRow />
      </>
    )
  }
  // unaudited burn
  if ('burn' in rowItem) {
    const isBurnOld =
      moment(rowItem.burn.blockTimestamp).diff(moment(), 'days') < -7
    const baseInfoText =
      'An unwrap can to take up to 3 business days from burn to completion.'
    const infoText = isBurnOld
      ? baseInfoText +
        ' This burn is more than 7 days old and no corresponding unwrap exists. It is most likely a test burn'
      : baseInfoText
    return (
      <>
        <TableRow
          type="Burned eUSD"
          icon={<BurnIcon />}
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
            <Box display="flex">
              <DetailsSection
                header="Burn"
                time={rowItem.burn.blockTimestamp}
                link={
                  <MCBurnLink
                    blockIndex={rowItem.burn.blockIndex}
                    burnTxo={rowItem.burn.publicKeyHex}
                  />
                }
                amount={rowItem.burn.amount}
                title="Burned eUSD"
                linkTitle="Burn Public Key"
              />
              <InfoSection
                icon={<InfoOutlinedIcon sx={{ color: 'primary.light' }} />}
                header="Info"
                text={infoText}
              />
            </Box>
          }
        />
        {!isBurnOld && (
          <TableRow
            type="Unwrap"
            icon={<PendingIcon sx={{ color: 'primary.light' }} />}
          />
        )}

        <SpacerRow />
      </>
    )
  }
  // unaudited deposit
  if ('deposit' in rowItem) {
    const ercSymbol = getSymbolFromContactAddress(rowItem.deposit.tokenAddr)
    return (
      <>
        <TableRow
          type={`Wrapped ${ercSymbol}`}
          icon={<EUSDWrapIcon pxSize={24} />}
          amount={rowItem.deposit.amount}
          amountIcon={getIconFromContactAddress(rowItem.deposit.tokenAddr)}
          timestamp={rowItem.deposit.executionDate}
          link={<EthLink hash={rowItem.deposit.ethTxHash} />}
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Wrap"
                time={rowItem.deposit.executionDate}
                link={<EthLink hash={rowItem.deposit.ethTxHash} />}
                amount={rowItem.deposit.amount}
                title={`${ercSymbol} received by custodian multisig`}
                linkTitle="Eth Tx Hash"
              />
              <InfoSection
                icon={<InfoOutlinedIcon sx={{ color: 'primary.light' }} />}
                header="Info"
                text="A wrap can to take up to 3 business days to complete."
              />
            </Box>
          }
        />
        <TableRow
          type="Mint"
          icon={<PendingIcon sx={{ color: 'primary.light' }} />}
        />
        <SpacerRow />
      </>
    )
  }
  // unaudited withdrawal
  if ('executionDate' in rowItem) {
    const ercSymbol = getSymbolFromContactAddress(rowItem.tokenAddr)
    return (
      <>
        <TableRow
          type={`Unwrapped ${ercSymbol}`}
          icon={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={24}
              height={24}
            >
              <AlertIcon />
            </Box>
          }
          amount={rowItem.amount}
          amountIcon={getIconFromContactAddress(rowItem.tokenAddr)}
          timestamp={rowItem.executionDate}
          link={<EthLink hash={rowItem.ethTxHash} />}
          detailsComponent={
            <Box display="flex">
              <DetailsSection
                header="Unwrap"
                time={rowItem.executionDate}
                link={<EthLink hash={rowItem.ethTxHash} />}
                amount={rowItem.amount}
                title={`${ercSymbol} sent from custodian multisig`}
                linkTitle="Eth Tx Hash"
              />
              <InfoSection
                icon={<AlertIcon />}
                header="Alert"
                text="A corresponding burn of wrapped eUSD was not identified."
              />
            </Box>
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
            <Typography>{type}</Typography>
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
              <Typography>{formatEUSD(amount)}</Typography>
            </Stack>
          ) : (
            '--'
          )}
        </StyledTableCell>
        <StyledTableCell>
          {timestamp ? (
            <Typography>{moment(timestamp).format(dateFormat)}</Typography>
          ) : error ? (
            <Typography color="error.main">Missing...</Typography>
          ) : (
            <Typography color="warning.main">Pending...</Typography>
          )}
        </StyledTableCell>
        <StyledTableCell>{link ?? '--'}</StyledTableCell>
        <StyledTableCell sx={{ borderRight: borderStyle }}>
          {detailsComponent ? (
            <Button sx={{ textTransform: 'none', color: 'text.secondary' }}>
              <Typography>Details</Typography>
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
