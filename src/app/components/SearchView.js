'use client'
import React, { useState } from 'react'
import SearchBar from './SearchBar'
import PostCard from './Cards/PostCard'
import { Box } from '@chakra-ui/react'

export default function SearchView(props) {
    const { postMetadata } = props
    const [searchValue, setSearchValue] = useState('')

    return (
        <>
            {/* <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} /> */}
            <Box margin="0 auto" display={"flex"} flexDirection={"column"} width="fit-content" p={2}  >
                {postMetadata.filter(val => {
                    return val.title.includes(searchValue)
                }).map((post, postIndex) => {
                    return (
                        <PostCard key={postIndex} post={post} />
                    )
                })}
            </Box>
        </>
    )
}
