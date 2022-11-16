import { Grid } from '@mui/material'
import React, { FC } from 'react'
import { TAuditedMint } from '../types'

type TProps = {
    auditedWrap: TAuditedMint
}

export const AuditedWrap: FC<TProps> = ({ auditedWrap }: TProps) => {
    return (
        <Grid container >
            <Grid item xs={2} data-row="type">RSV Withdrawn</Grid>
            {/* TODO: fetch token ticker from live data*/}
            <Grid item xs={2} data-row="amount">{auditedWrap.deposit.amount} RSV</Grid>
            {/* TODO: fetch org name from live data */}
            <Grid item xs={2} data-row="lp">ExampleOrg</Grid>
            <Grid item xs={5} data-row="hash">{auditedWrap.deposit.ethTxHash}</Grid>
            {/* TODO: Details needs to be an expansion button */}
            <Grid item xs={1} data-row="details">Details</Grid>
            {/* row split */}
            <Grid item xs={2} data-row="type">Mint eUSD</Grid>
            {/* TODO: fetch token ticker from live data*/}
            <Grid item xs={2} data-row="amount">{auditedWrap.mint.amount} eUSD</Grid>
            <Grid item xs={2} data-row="lp">--</Grid>
            <Grid item xs={5} data-row="hash">{auditedWrap.mint.nonceHex}</Grid>
            <Grid item xs={1} data-row="details">{' '}</Grid>
        </Grid>
    )
}