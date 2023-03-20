import React, { useState, useRef, useLayoutEffect } from 'react'
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material'

import useMintsAndBurns from '../api/hooks/useMintsAndBurns'
import WrapTableRow, { UnAuditedMintTableRow } from './WrapTableRow'

const PAGE_LENGTH = 10

export default function MintsAndBurns() {
  const { auditedData, unauditedMints } = useMintsAndBurns()
  console.log(unauditedMints)
  const [currentPage, setCurrentPage] = useState(1)
  const tableEl = useRef<HTMLTableElement>(null)
  const [distanceBottom, setDistanceBottom] = useState(0)

  const scrollListener = () => {
    if (!tableEl.current) {
      return
    }
    const bottom = tableEl.current.scrollHeight - tableEl.current.clientHeight
    if (!distanceBottom) {
      setDistanceBottom(Math.round(bottom * 0.6))
    }
    if (
      tableEl.current.scrollTop > bottom - distanceBottom &&
      currentPage * PAGE_LENGTH < auditedData.length
    ) {
      setCurrentPage(currentPage + 1)
    }
  }

  useLayoutEffect(() => {
    const tableRef = tableEl?.current
    if (!tableRef) {
      return
    }
    tableRef.addEventListener('scroll', scrollListener)
    return () => {
      tableRef.removeEventListener('scroll', scrollListener)
    }
  }, [scrollListener])

  return (
    <>
      <Box marginBottom={4}>
        <Typography variant="h5" gutterBottom>
          Wrapping and Unwrapping
        </Typography>
        <Box overflow="hidden">
          <TableContainer
            ref={tableEl}
            sx={{ overflowY: 'scroll', maxHeight: 600 }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Block Index</TableCell>
                  <TableCell>Eth Tx</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditedData
                  .slice(0, currentPage * PAGE_LENGTH)
                  .map((mintOrBurn, index) => (
                    <WrapTableRow
                      rowItem={mintOrBurn}
                      key={`mintOrBurnRow-${index}`}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      <Box marginBottom={4}>
        <Typography variant="h5" gutterBottom>
          Unpaired Mints
        </Typography>
        <Box>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recipient Address</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Block Index</TableCell>
                  <TableCell>Nonce Hex</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unauditedMints.map((mint, index) => (
                  <UnAuditedMintTableRow
                    mint={mint}
                    key={`unAuditedMint-${index}`}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      <Box marginBottom={4}>
        <Typography variant="h5" gutterBottom>
          Unpaired Withdrawals
        </Typography>
        <Box>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recipient Address</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Block Index</TableCell>
                  <TableCell>Nonce Hex</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unauditedMints.map((mint, index) => (
                  <UnAuditedMintTableRow
                    mint={mint}
                    key={`unAuditedMint-${index}`}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  )
}
