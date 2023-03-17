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
import WrapTableRow from './WrapTableRow'

export default function MintsAndBurns() {
  const auditedData = useMintsAndBurns()
  console.log(auditedData)

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
              <TableCell>Block Index</TableCell>
              <TableCell>Eth Tx</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditedData.map((mintOrBurn, index) => (
              <WrapTableRow
                rowItem={mintOrBurn}
                key={`mintOrBurnRow-${index}`}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
