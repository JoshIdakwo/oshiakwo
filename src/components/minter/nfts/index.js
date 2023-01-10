import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  getNfts,
  createNft,
  swapNft,
  buyNft,
  requestNftSwap,
  isFav,
} from "../../../utils/minter";
import { Row } from "react-bootstrap";


const NftList = ({ minterContract, name }) => {
  const { performActions, address } = useContractKit();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAssets = useCallback(async () => {
    try {
      setLoading(true);
      const allNfts = await getNfts(minterContract);
      if (!allNfts) return;
      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract]);

  const addNft = async (data) => {
    try {
      await createNft(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };

  const changeFav = async (index) => {
    try {
      await isFav(performActions, minterContract, index);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch (error) {
      toast(<NotificationError text="Failed to like the NFT" />);
    } finally {
      setLoading(false);
    }
  }

  const swapRequest = async (data) => {
    const {style2, id} = data;
    try {
      await requestNftSwap(performActions, minterContract, id, style2);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch (error) {
      toast(<NotificationError text="Failed to request NFT swap" />);
    } finally {
      setLoading(false);
    }
  }

  const approveSwap = async (style2) => {
    try{
      const requester = await minterContract.methods.requests(style2).call();
      const swapReq = await minterContract.methods.swaps(requester).call();
      const {giveStyle, receiveStyle} = swapReq;
      await swapNft(performActions, minterContract, giveStyle, receiveStyle);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch(error) {
      toast(<NotificationError text="Failed to approve swap request" />);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const buy = async (tokenId) => {
    const {id} = tokenId;
    try {
      setLoading(true);
      await buyNft(performActions, minterContract, id);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch (e) {
      console.log({e})
      toast(<NotificationError text="Failed to buy NFT." />);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    try {
      if (address && minterContract) {
        getAssets();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getAssets]);

  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>
              <AddNfts save={addNft} address={address} />
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
              {nfts.map((_nft) => (
                <Nft
                  key={_nft.index}
                  nft={{
                    ..._nft,
                  }}
                  changeFav={changeFav}
                  swap={swapRequest}
                  swapApprove={approveSwap}
                  minterContract={minterContract}
                  buy={buy}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  minterContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,
};

export default NftList;