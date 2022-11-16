import { Typography } from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import { getAuditedMints } from '../../api/apiHandler'
import { TAuditedMint } from '../../types'
import { PartialWrap } from '../PartialWrap'
import { ListConstructor } from './ListConstructor'

export const WrapsList: FC = () => {
    const [wraps, setWraps] = useState<TAuditedMint[]>([])
    const [wrapsPage, setWrapsPage] = useState<number>(0)

    useEffect(() => {
        const fetchData = async () => {
            await fetchWraps()
        }
        fetchData()
    }, [])

    const fetchWraps = async () => {
        const newWraps = await getAuditedMints(wrapsPage)
        setWraps(wraps.concat(newWraps))
        setWrapsPage(wrapsPage + 1)
    }

    /**
     * TODO: hasMore={true} should come from data, not hardcoded
     */

    return (<>
        <Typography>Unwraps</Typography>
        <ListConstructor dataLength={wraps.length} next={fetchWraps} hasMore={true} transactionType="wraps">
            {wraps.map((wrap, index) => (<PartialWrap partialWrap={wrap} key={index} />))}
        </ListConstructor>
    </>)
}