import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import {
  NftSwapV4,
  SwappableAssetV4,
  SwappableNftV4,
  SignedNftOrderV4,
} from '@traderxyz/nft-swap-sdk'
import {
  PostOrderResponsePayload,
  SearchOrdersResponsePayload,
} from '@traderxyz/nft-swap-sdk/dist/sdk/v4/orderbook'

const CreateOrderScreen = () => {
  const [takerAssetAddress, setTakerAssetAddress] = useState<
    undefined | string
  >(undefined)
  const [takerAssetAmount, setTakerAssetAmount] = useState<undefined | string>(
    undefined,
  )

  const [bidDetails, setBidDetails] = useState<any[]>([])

  const [orderDetails, setOrderDetails] = useState<any>({})
  const { tokenAddress, tokenId } = useParams()

  const provider = new ethers.providers.Web3Provider((window as any).ethereum)
  const signer = provider.getSigner()
  const nftSwapSdk = new NftSwapV4(provider, signer, 137)

  useEffect(() => {
    console.log('orderDetails', orderDetails)
  }, [orderDetails, bidDetails])

  // This function is used to create the order
  const createOrder = async (
    tokenAddress: string | undefined,
    tokenId: string | undefined,
  ) => {
    try {
      const walletAddressUserA = await signer.getAddress()
      console.log('addressA', walletAddressUserA)
      // Asset which user is selling
      const MAKER_ASSET: SwappableAssetV4 = {
        tokenAddress: tokenAddress as string,
        tokenId: tokenId as string,
        type: 'ERC721',
      }

      const assetsToSwapMaker = [MAKER_ASSET]

      const TAKER_ASSET: SwappableAssetV4 = {
        tokenAddress: takerAssetAddress as string,
        amount: '6900',
        type: 'ERC20',
      }

      // approving makerAsset to swapSdk
      const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
        MAKER_ASSET,
        walletAddressUserA,
      )
      console.log(`approvalStatusForUserA`, approvalStatusForUserA)

      // If we do need to approve makers assets for swapping, do that
      if (!approvalStatusForUserA.contractApproved) {
        const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
          assetsToSwapMaker[0],
          walletAddressUserA,
        )
        const approvalTxReceipt = await approvalTx.wait()
        console.log('approvalReceipt', approvalTxReceipt)
      }
      console.log('approvalStatus', approvalStatusForUserA)
      const order = nftSwapSdk.buildNftAndErc20Order(
        MAKER_ASSET,
        TAKER_ASSET,
        'sell',
        walletAddressUserA,
      )
      // Signing the order using the maker's wallet address
      const signedOrder = await nftSwapSdk.signOrder(order)

      // if(localStorage.getItem('data') == null){
      //     localStorage.setItem('data' , '[]');
      // }

      // var old_data = JSON.parse(localStorage.getItem('data') as any)
      // old_data.push(signedOrder)
      // localStorage.setItem('data' , JSON.stringify(old_data));

      //   localStorage.setItem('signedorder', JSON.stringify(signedOrder))
      //   console.log('signedOrder', signedOrder)

      //   const postOrder = await nftSwapSdk.postOrder(signedOrder, '137')
      //   console.log('postOrder', postOrder)
      //   getOrder
      //   const getOrderDetails = await nftSwapSdk.getOrders({
      //     nonce: postOrder.order.nonce,
      //   })
      setOrderDetails(signedOrder)
      //   const getOrders = nftSwapSdk.
    } catch (err) {
      console.log('err', err)
    }
  }

  const createBid = async (eachOrderDetail: PostOrderResponsePayload) => {
    try {
      const bidAmount = prompt('Enter the price you are bidding')
      if (bidAmount) {
        const walletAddressUserB = await signer.getAddress()
        console.log('addressA', walletAddressUserB)
        // Asset which user is selling
        const MAKER_ASSET: SwappableAssetV4 = {
          tokenAddress: eachOrderDetail.erc20Token as string,
          amount: bidAmount as string,
          type: 'ERC20',
        }

        const assetsToSwapMaker = [MAKER_ASSET]

        const TAKER_ASSET: SwappableNftV4 = {
          tokenAddress: (eachOrderDetail as any).erc721Token,
          tokenId: (eachOrderDetail as any).erc721TokenId,
          type: 'ERC721',
        }

        // approving makerAsset to swapSdk
        const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
          MAKER_ASSET,
          walletAddressUserB,
        )
        console.log(`approvalStatusForUserA`, approvalStatusForUserA)

        // If we do need to approve makers assets for swapping, do that
        if (!approvalStatusForUserA.contractApproved) {
          const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
            assetsToSwapMaker[0],
            walletAddressUserB,
          )
          const approvalTxReceipt = await approvalTx.wait()
          console.log('approvalReceipt', approvalTxReceipt)
        }
        console.log('approvalStatus', approvalStatusForUserA)
        const order = nftSwapSdk.buildOrder(
          MAKER_ASSET,
          TAKER_ASSET,
          walletAddressUserB,
          {
            nonce: '310',
          },
        )
        // Signing the order using the maker's wallet address
        const signedOrder = await nftSwapSdk.signOrder(order)
        if (localStorage.getItem('data') == null) {
          localStorage.setItem('data', '[]')
        }

        var old_data = JSON.parse(localStorage.getItem('data') as any)
        old_data.push(signedOrder)
        localStorage.setItem('data', JSON.stringify(old_data))
        const bids = localStorage.getItem('data') as any
        const parseBids = JSON.parse(bids)
        setBidDetails(parseBids)
        console.log('bids', parseBids)
      }
    } catch (err) {
      console.log('err', err)
    }
  }

  const approveBid = async (approveBid: any) => {
    console.log('approveBid', approveBid)
    try {
      const walletAddressUserB = await signer.getAddress()
      console.log('addressB', walletAddressUserB)

      // Approving the taker asset to swapSdk`

      // If we do need to approve makers assets for swapping, do that

      // Filling the order (Pass the signed order)
      const fillTx = await nftSwapSdk.fillSignedOrder(approveBid, undefined, {
        gasLimit: '600000',
      })
      console.log('fillTx', fillTx)

      // Wait for the transaction receipt
      const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx.hash)
      console.log(
        `🎉 🥳 Order filled. TxHash: ${fillTxReceipt.transactionHash}`,
      )
    } catch (err) {
      console.log('err', err)
    }
  }

  //   const getOrder = async () => {

  //       try {
  //         const orders = nftSwapSdk.getOrders({
  //             nonce:"40",
  //             maker:"0x930e7B59e522a9860E3D1175C8f0920fc202Aa77"
  //         })
  //       }
  //       catch(err){
  //         console.log("error" , err)
  //       }
  //   }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid red',
            width: '300px',
            height: '150px',
            justifyContent: 'space-between',
          }}
        >
          <input
            value={takerAssetAddress}
            onChange={(e) => setTakerAssetAddress(e.target.value)}
            type="text"
            placeholder="Enter the address of token you want"
          />
          <input
            value={takerAssetAmount}
            onChange={(e) => setTakerAssetAmount(e.target.value)}
            type="text"
            placeholder="Enter the amount of token you want"
          />
          <button
            onClick={() => {
              createOrder(tokenAddress, tokenId)
            }}
          >
            Create Order
          </button>
        </div>
      </div>
      <h1>Order Details</h1>
      <div style={{ fontSize: '10px' }}>
        {/* <p>chainId:{orderDetails.chainId}</p> */}
        <p>Token Seller want: {orderDetails?.erc20Token}</p>
        <p>amount: {orderDetails?.erc20TokenAmount}</p>
        <p>nft selling: {orderDetails?.erc721Token}</p>
        <p>tokenId: {orderDetails?.erc721TokenId}</p>
        <p>maker : {orderDetails?.maker}</p>
        <button
          onClick={() => {
            createBid(orderDetails)
          }}
        >
          Create Bid
        </button>
      </div>

      <h1>Bids</h1>
      {bidDetails?.map((bidDetails, i) => {
        return (
          <div key={i}>
            <h4>Bid Number {i}</h4>
            <p>token buyer is giving for the order:{bidDetails.erc20Token}</p>
            <p>amount : {bidDetails.erc20TokenAmount}</p>
            <p>token buyer want : {bidDetails.erc721Token}</p>
            <p>tokenId : {bidDetails.erc721TokenId}</p>
            <button
              onClick={() => {
                approveBid(bidDetails)
              }}
            >
              Approve Bid
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default CreateOrderScreen
