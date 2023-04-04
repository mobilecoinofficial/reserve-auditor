import React, { useRef, useLayoutEffect, useMemo } from 'react'
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
import useThrottle from '../utils/useThrottle'

export const getTableHeightToSubtract = (renderTopContents = false) => {
  // This is a little brittle a needs to be adjusted if we modify the top of this page.
  // We want the table to be as tall as possible, but we need to provide a fixed height
  // in order for the infinite scroll to work
  const headerHeight = 64
  const headerPadding = 48
  const topContentsHeight = 250
  const tableBottomPadding = 64
  let tableHeightToSubtract =
    headerHeight + headerPadding + topContentsHeight + tableBottomPadding
  if (!renderTopContents) {
    tableHeightToSubtract -= topContentsHeight
  }
  return tableHeightToSubtract
}

export default function MintsAndBurns({
  data,
  renderTopContent,
  setRenderTopContent,
}: {
  data: TTableData[]
  renderTopContent: boolean
  setRenderTopContent: (render: boolean) => void
}) {
  const tableEl = useRef<HTMLTableElement>(null)
  // state used for dynamically rendering top content on scroll
  const scrollHeight = useRef(0)

  const throttledContentListener = useThrottle(() => {
    if (!tableEl.current) {
      return
    }
    // ignore sideways scrolling
    if (scrollHeight.current - tableEl?.current.scrollTop === 0) {
      return
    }
    // anytime we're scrolling down, hide the top content.
    // any time we're scrolling up, show the top content.
    const scrollDirection =
      scrollHeight.current - tableEl?.current.scrollTop > 0 ? 'up' : 'down'
    const scrolledUpEnough =
      scrollHeight.current - tableEl?.current.scrollTop > 800 ||
      tableEl?.current.scrollTop === 0
    const scrolledDownEnough =
      scrollHeight.current - tableEl?.current.scrollTop < -200
    if (scrollDirection === 'up' && !renderTopContent && scrolledUpEnough) {
      setRenderTopContent(true)
    } else if (
      scrollDirection === 'down' &&
      renderTopContent &&
      scrolledDownEnough
    ) {
      setRenderTopContent(false)
    }
    scrollHeight.current = tableEl?.current.scrollTop
  }, 500)

  useLayoutEffect(() => {
    const tableRef = tableEl?.current
    if (!tableRef) {
      return
    }
    tableRef.addEventListener('scroll', throttledContentListener)
    return () => {
      tableRef.addEventListener('scroll', throttledContentListener)
    }
  }, [throttledContentListener])

  const tableHeightToSubtract = useMemo(
    () => getTableHeightToSubtract(renderTopContent),
    [renderTopContent]
  )

  return (
    <Box marginBottom={4} paddingTop={2}>
      <Typography variant="h5" gutterBottom>
        Wrapping and Unwrapping
      </Typography>
      <Box overflow="hidden">
        <TableContainer
          ref={tableEl}
          // infinite scrolls depends on the relationship between this height value and the PAGE_LENGTH
          sx={{
            overflowY: 'scroll',
            maxHeight: `calc(100vh - ${tableHeightToSubtract}px)`,
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
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    Block Index/Tx Hash
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <WrapTableRow rowItem={row} key={`mintOrBurnRow-${index}`} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
