import React from 'react'
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

export default function MintsAndBurns() {
  useMintsAndBurns()

  return (
    <Box marginBottom={4}>
      <Typography variant="h5" gutterBottom>
        Wrapping and Unwrapping
      </Typography>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Hash</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody></TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
