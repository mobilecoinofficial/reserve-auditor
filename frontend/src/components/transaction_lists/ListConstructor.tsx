import { Typography } from '@mui/material'
import React, { FC } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

type TProps = {
    dataLength: number,
    next: () => any,
    hasMore: boolean,
    children: React.ReactNode
    transactionType: "wraps" | "unwraps"
}

export const ListConstructor: FC<TProps> = ({ dataLength, next, hasMore, children, transactionType }: TProps) => {
    return (
        <>
            <Typography>ListConstructor</Typography>
            <div
                id={`infinite_${transactionType}`}
                style={{
                    maxHeight: '75vh',
                    width: 'calc(36vw + 74px)',
                    overflow: 'auto',
                    backgroundColor: '#fff',
                    padding: 1,
                    borderRadius: '5px',
                    boxShadow: 'rgba(0, 0, 0, 1) 0px 5px 15px',
                }}
            >
                <InfiniteScroll
                    dataLength={dataLength}
                    next={next}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}
                    scrollableTarget={`infinite_${transactionType}`}
                >
                    {children}
                </InfiniteScroll>
            </div>
        </>
    )
}