// @ts-nocheck
import { Box, AspectRatio, Button } from "theme-ui";
import { utils } from 'near-api-js'
import { useNFTViewMethod, useNFTContract, useNearHooksContainer, useMarketMethod } from '@cura/hooks'
import { CreatorShare, Bidders, MediaObject } from '@cura/components'
import { useSetRecoilState } from 'recoil'

import Layout from "../containers/Layout";
import { project } from "../utils/project";
import { alertMessageState, indexLoaderState } from '../state/recoil'


const CONTRACT_BURN_GAS = utils.format.parseNearAmount(`0.00000000029`) // 290 Tgas
const MARKET_ACCEPT_BID_GAS = utils.format.parseNearAmount(`0.00000000025`) // 250 Tgas
const YOCTO_NEAR = utils.format.parseNearAmount(`0.000000000000000000000001`)

const HARDCODED_ROYALTY_ADDRESS = 'sample.address'
const HARDCODED_ROYALTY_SHARE = `2500`


const View = () => {

  const { accountId } = useNearHooksContainer()
  const { contract } = useNFTContract(project)

  const setAlertMessage = useSetRecoilState(alertMessageState)
  const setIndexLoader = useSetRecoilState(indexLoaderState)

  const { data: media } = useNFTViewMethod(
      `${project}`,
      `nft_tokens_for_owner`,
      {
          account_id: accountId,
      },
      null
  )

  const { data: bids } = useMarketMethod(
      `market.share.ysn-1_0_0.ysn.testnet`,
      `get_bids`,
      {
          token_id: media?.[0]?.id,
      }
  )


  async function burnDesign() {
      setIndexLoader(true)
      try {
          await contract.burn_design(
              { token_id: media?.[0]?.id },
              CONTRACT_BURN_GAS,
              YOCTO_NEAR
          )
      } catch (e) {
          setIndexLoader(false)
          setAlertMessage(e.toString())
      }
  }


  async function acceptBid(bidder: string) {
      setIndexLoader(true)
      try {
          await contract.accept_bid(
              {
                  token_id: media?.[0]?.id,
                  bidder: bidder,
              },
              MARKET_ACCEPT_BID_GAS,
              YOCTO_NEAR
          )
      } catch (e) {
          setIndexLoader(false)
          setAlertMessage(e.toString())
      }
  }

  return (
    <>
      <Layout requireAuth={true} >
        <Box
                sx={{
                    mt: 50
                }}
            >
                <Box
                    sx={{
                        display: ['block', 'block', 'block','inline-block'],
                        width: ['100%', '70%', '70%', '50%'],
                        mr: [0, 'auto', 'auto', 6],
                        ml: [0, 'auto', 'auto', 0],
                        mb: [2, 0],
                        textAlign:'center',
                    }}
                >
                    <AspectRatio
                        ratio={1}
                        sx={{
                            bg: 'gray.3',
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 36,
                            width: '100%',
                            maxHeight: '100%',
                            marginLeft: 'auto',
                            marginRight:'auto',
                        }}
                    >
                        {media?.[0]?.metadata?.media && (
                            <MediaObject
                                mediaURI={`https://arweave.net/${media[0].metadata.media}`}
                                width={`100%`}
                                height={`100%`}
                            />
                        )}
                    </AspectRatio>
                </Box>
                <Box
                    sx={{
                        mt: 0,
                        display: ['block', 'block', 'block','inline-block'],
                        verticalAlign: 'top',
                        margin: 'auto',
                        width: ['100%', '70%', '70%', '30%'],
                        mb: [50, 0]
                    }}
                >
                    <Button onClick={burnDesign} variant="borderless">
                        BURN
                    </Button>

                    {bids && <Bidders bidders={bids} onAcceptBid={acceptBid} />}

                    <CreatorShare
                        address={HARDCODED_ROYALTY_ADDRESS}
                        share={HARDCODED_ROYALTY_SHARE}
                    />

                </Box>
            </Box>
      </Layout>
    </>
  );
};

export default View;
