import React, { useState, useRef, useLayoutEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material'

import useMintsAndBurns from '../api/hooks/useMintsAndBurns'
import WrapTableRow, {
  UnAuditedMintTableRow,
  UnauditedWithdrawalTableRow,
} from './WrapTableRow'

const PAGE_LENGTH = 15

export default function MintsAndBurns() {
  const { auditedData, unauditedMints, unauditedWithdrawals } =
    useMintsAndBurns()
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
    console.log(auditedData.length)
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
    <Grid container columnSpacing={2}>
      <Grid item xs={12}>
        <Box marginBottom={4}>
          <Typography variant="h5" gutterBottom>
            Wrapping and Unwrapping
          </Typography>
          <Box overflow="hidden">
            <TableContainer
              ref={tableEl}
              // infinite scrolls depends on the relationship between this height value and the PAGE_LENGTH
              sx={{ overflowY: 'scroll', maxHeight: 550 }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Block Index</TableCell>
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
      </Grid>
      <Grid item sm={12} md={6}>
        <Box marginBottom={4}>
          <Typography variant="h5" gutterBottom>
            Unpaired Mints
          </Typography>
          <Box>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Block Index</TableCell>
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
      </Grid>
      <Grid item sm={12} md={6}>
        <Box marginBottom={4}>
          <Typography variant="h5" gutterBottom>
            Unpaired Unwraps
          </Typography>
          <Box>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Eth Tx</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unauditedWithdrawals.map((withdrawal, index) => (
                    <UnauditedWithdrawalTableRow
                      withdrawal={withdrawal}
                      key={`unAuditedWithdrawal-${index}`}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Grid>
      <Grid item sm={12} md={6}>
        <Box marginBottom={4}>
          <Typography variant="h5" gutterBottom>
            Unpaired Burns
          </Typography>
          <Box>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Block Index</TableCell>
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
      </Grid>
      <Grid item sm={12} md={6}>
        <Box marginBottom={4}>
          <Typography variant="h5" gutterBottom>
            Unpaired Wraps
          </Typography>
          <Box>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Eth Tx</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[].map((withdrawal, index) => (
                    <UnauditedWithdrawalTableRow
                      withdrawal={withdrawal}
                      key={`unAuditedWithdrawal-${index}`}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}
