import React from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Typography, Box, Tooltip, IconButton, Link } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'

import { abbreviateHash } from '../utils/truncate'

export default function CopyableField({
  text,
  abbreviate = true,
  link,
  copy = true,
}: {
  text: string
  abbreviate?: boolean
  link: string
  copy?: boolean
}) {
  function copyToClipboard(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
  }

  const renderedText = abbreviate ? abbreviateHash(text) : text

  return (
    <Box display="flex" alignItems="center">
      <Typography sx={{ fontSize: 14, marginRight: 1 }}>
        {renderedText}
      </Typography>
      {copy && (
        <Tooltip title="Copy to clipboard">
          <IconButton onClick={copyToClipboard} edge="start" size="small">
            <ContentCopyIcon
              sx={{
                cursor: 'pointer',
                color: 'text.secondary',
                height: 16,
                width: 16,
              }}
            />
          </IconButton>
        </Tooltip>
      )}
      {link && (
        <Tooltip title="Go to blockchain">
          <Link href={link} target="_blank" rel="noreferrer">
            <IconButton
              onClick={(e) => e.stopPropagation()}
              edge="start"
              size="small"
            >
              <LaunchIcon
                sx={{
                  cursor: 'pointer',
                  color: 'text.secondary',
                  height: 16,
                  width: 16,
                }}
              />
            </IconButton>
          </Link>
        </Tooltip>
      )}
    </Box>
  )
}
