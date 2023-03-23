import React from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Typography, Box, Tooltip, IconButton } from '@mui/material'

import { abbreviateHash } from '../utils/truncate'

export default function CopyableField({
  text,
  abbreviate = true,
}: {
  text: string
  abbreviate?: boolean
}) {
  function copyToClipboard(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
  }

  const renderedText = abbreviate ? abbreviateHash(text) : text

  return (
    <Box display="flex" alignItems="center">
      <Tooltip title={text}>
        <IconButton
          onClick={copyToClipboard}
          edge="start"
          sx={{ paddingLeft: '12px' }}
        >
          <ContentCopyIcon
            sx={{ cursor: 'pointer', color: 'text.secondary' }}
            fontSize="small"
          />
        </IconButton>
      </Tooltip>
      <Typography sx={{ fontSize: 14 }}>{renderedText}</Typography>
    </Box>
  )
}
