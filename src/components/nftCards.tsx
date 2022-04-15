import React, { useEffect, useState } from 'react'
import { NftSwapV4 } from '@traderxyz/nft-swap-sdk'
import { ethers } from 'ethers'
import Moralis from 'moralis'
import { useNavigate } from 'react-router-dom'

interface NFT  {
  imageUri: any
  token_address: string
  token_id: string
  contract_type: string
  owner_of: string
  block_number: string
  block_number_minted: string
  token_uri?: string | undefined
  metadata?: string | undefined
  synced_at?: string | undefined
  amount?: string | undefined
  name: string
  symbol: string
}

const NftRender = () => {
  const [tokenDetails, setTokenDetails] = useState<NFT[] | null>(null)
  const navigate = useNavigate()

  const provider = new ethers.providers.Web3Provider((window as any).ethereum)
  const signer = provider.getSigner()
  const nftSwapSdk = new NftSwapV4(provider, signer, 137)

  const navigateToCreateOrderScreen = (
    tokenAddress: string,
    tokenId: string,
  ) => {
    navigate(`/create-order/${tokenAddress}/${tokenId}`)
  }

  const renderTokenDetails = async () => {
    console.log('running')
    try {
      Moralis.start({
        serverUrl: 'https://cf9fruvrhdjf.usemoralis.com:2053/server',
        appId: 'dcqppTIrxtJBXYKRfoPYmPNPnzaB8rEzonDNHRk6',
      })

      const nfts = await Moralis.Web3API.account.getNFTs({
        chain: '0x89',
        address: await signer.getAddress(),
      })
      if (nfts && nfts.result) {
        nfts.result?.map(async (arr) => {
          if (arr.token_uri !== null) {
            const tokenUri = await (await fetch(arr.token_uri! as any)).json()
            const myArr = [{ ...arr, imageUri: tokenUri.image }]
            console.log('myArr', myArr)
            setTokenDetails(myArr)
          }
        })
      }
    } catch (err) {
      console.log('error', err)
    }
  }

  useEffect(() => {
    renderTokenDetails()
  }, [])

  useEffect(() => {
    console.log('result', tokenDetails)
  }, [tokenDetails])

  return (
    <div>
      {tokenDetails ? (
              tokenDetails.map((arr, i) => {
                return (
                  <div
                    key={i}
                    style={{
                      marginLeft: '2rem',
                      backgroundColor: 'lightpink',
                      width: '200px',
                      display: 'flex',
                      flex: 0.25,
                      flexDirection: 'column',
                    }}
                  >
                    <img src={arr.imageUri} />
                    <button
                      onClick={() => {
                        navigateToCreateOrderScreen(arr.token_address, arr.token_id)
                      }}
                    >
                      Create Order
                    </button>
                    <button>Sell Order</button>
                  </div>
                )
              })
      ) : <h1>No NFT</h1>}
    </div>
  )
}

export default NftRender
