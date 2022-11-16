import { Grid } from '@mui/material'
import React, { FC } from 'react'
import { TAuditedBurn } from '../types'

type TProps = {
    partialUnwrap: TAuditedBurn
}

export const PartialUnwrap: FC<TProps> = ({ partialUnwrap }: TProps) => {
    return (
        <Grid container >
            <Grid item xs={2} data-row="type">RSV Withdrawn</Grid>
            {/* TODO: fetch token ticker from live data*/}
            <Grid item xs={2} data-row="amount">{partialUnwrap.withdrawal.amount} RSV</Grid>
            {/* TODO: fetch org name from live data */}
            <Grid item xs={2} data-row="lp">ExampleOrg</Grid>
            <Grid item xs={5} data-row="hash">{partialUnwrap.withdrawal.ethTxHash}</Grid>
            {/* TODO: Details needs to be an expansion button */}
            <Grid item xs={1} data-row="details">Details</Grid>
            {/* row split */}
            <Grid item xs={2} data-row="type">Mint eUSD</Grid>
            {/* TODO: fetch token ticker from live data*/}
            <Grid item xs={2} data-row="amount">{partialUnwrap.burn.amount} eUSD</Grid>
            <Grid item xs={2} data-row="lp">--</Grid>
            <Grid item xs={5} data-row="hash">{partialUnwrap.burn.publicKeyHex}</Grid>
            <Grid item xs={1} data-row="details">{' '}</Grid>
        </Grid>
    )
}