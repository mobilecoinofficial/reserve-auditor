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

import { TTableData } from '../api/hooks/useMintsAndBurns'
import WrapTableRow from './WrapTableRow'

const PAGE_LENGTH = 15
const TOP_CONTENT_HEIGHT = 264

export default function MintsAndBurns({ data }: { data: TTableData[] }) {
  const ddata = [...data, ...data, ...data, ...data, ...data, ...data, ...data]
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
      currentPage * PAGE_LENGTH < ddata.length
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
    <Box marginBottom={4}>
      <Typography variant="h5" gutterBottom>
        Wrapping and Unwrapping
      </Typography>
      <Box overflow="hidden">
        <TableContainer
          ref={tableEl}
          // infinite scrolls depends on the relationship between this height value and the PAGE_LENGTH
          sx={{
            overflowY: 'scroll',
            maxHeight: `calc(100vh - ${400}px)`,
          }}
        >
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
              </TableRow>
            </TableHead>
            <TableBody>
              {ddata.slice(0, currentPage * PAGE_LENGTH).map((row, index) => (
                <WrapTableRow rowItem={row} key={`mintOrBurnRow-${index}`} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
