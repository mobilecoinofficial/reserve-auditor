import { Typography } from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import { getAuditedBurns } from '../../api/apiHandler'
import { TAuditedBurn } from '../../types'
import { PartialUnwrap } from '../PartialUnwrap'
import { ListConstructor } from './ListConstructor'

export const UnwrapsList: FC = () => {
    const [unwraps, setUnwraps] = useState<TAuditedBurn[]>([])
    const [unwrapsPage, setUnwrapsPage] = useState<number>(0)

    useEffect(() => {
        const fetchData = async () => {
            await fetchUnwraps()
        }
        fetchData()
    }, [])

    const fetchUnwraps = async () => {
        const newUnwraps = await getAuditedBurns(unwrapsPage)
        setUnwraps(unwraps.concat(newUnwraps))
        setUnwrapsPage(unwrapsPage + 1)
    }

    /**
     * TODO: hasMore={true} should come from data, not hardcoded
     */

    return (<>  
        <Typography>Unwraps</Typography>
        <ListConstructor dataLength={unwraps.length} next={fetchUnwraps} hasMore={true} transactionType="unwraps">
            {unwraps.map((unwrap, index) => (<PartialUnwrap partialUnwrap={unwrap} key={index} />))}
        </ListConstructor>
    </>)
}