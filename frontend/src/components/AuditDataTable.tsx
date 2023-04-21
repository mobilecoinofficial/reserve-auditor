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

import { TTableData } from '../api/hooks/useTableData'
import DataTableRow from './DataTableRow'

export const getTableHeightToSubtract = (renderTopContents = false) => {
  // This is a little brittle a needs to be adjusted if we modify the top of this page.
  // We want the table to be as tall as possible, but we need to provide a fixed height
  // in order for the infinite scroll to work
  const headerHeight = 64
  const headerPadding = 48
  const tableBottomPadding = 64
  const topContentsHeight = 250
  let tableHeightToSubtract =
    headerHeight + headerPadding + topContentsHeight + tableBottomPadding
  if (!renderTopContents) {
    tableHeightToSubtract -= topContentsHeight
  }
  return tableHeightToSubtract
}

export default function AuditDataTable({ data }: { data: TTableData[] }) {
  return (
    <Box marginBottom={4} paddingTop={2}>
      <Typography variant="h5" gutterBottom>
        Wrapping and Unwrapping
      </Typography>
      <Box overflow="hidden">
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <DataTableRow rowItem={row} key={`mintOrBurnRow-${index}`} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
