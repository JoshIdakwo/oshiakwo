import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Card, Col, Badge, Stack, Button } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";
import notFav from "../../../assets/icons/icons8-favorite-50.png";
import isFav from "../../../assets/icons/icons8-favorite-48.png";
import Popup from "../../ui/Popup";
import ApproveSwap from "../../ui/ApproveSwap";

const NftCard = ({ nft, changeFav, swap, swapApprove, minterContract, buy }) => {
  const { index, image, name, price, sold, owner, swapRequest } = nft;
  const { performActions, address } = useContractKit();
  const [fav, setFav] = useState(false);

  const isOwner = (id) => {
    if(owner === address) {
      if(sold) {
        return <>
            <Popup data={(style2) => {
              swap({...style2, id});
              }}
            />
            <Button disabled className="ms-2" variant="outline-dark">Sold</Button>
          </>
      }
      else {
        return <Popup data={(style2)=> {swap({...style2, id})}}/>
      }
    }
    else {
      return <Button variant="outline-dark" onClick={()=>{buy({id})}}>Buy</Button>
    }
  }

  const favFunc = async() => {
    try {
      performActions(async(kit) => {
        const {defaultAccount} = kit;
        const isFav = await minterContract.methods.favs(index, defaultAccount).call();
        setFav(isFav);
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=> {
    try{
      favFunc();
    } catch(error) {
      console.log(error);
    }
  }, [])

  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {index} ID
            </Badge>
          </Stack>
        </Card.Header>

        <div className="img-container ratio ratio-4x3">
          <img src={image} alt={name} style={{ objectFit: "contain" }} />
          <div className="fav-icon ps-2 d-flex justify-content-between align-items-center">
            {fav ? (
              <img onClick={()=> {changeFav(index)}} src={isFav} alt="fav icon" />
            ):(
              <img onClick={()=> {changeFav(index)}} src={notFav} alt="fav icon" />
            )}
            {/* {swapRequest && <p className="px-2 py-1 m-0 fw-bold" onClick={() => {swapApprove({index})}}>Approve swap</p>} */}
            {swapRequest && <ApproveSwap style2={index} swapReq={swapRequest} minterContract={minterContract} approve={()=>{swapApprove(index)}}/>}
          </div>
        </div>

        <Card.Body className="d-flex flex-column text-center pt-0" style={{ backgroundColor: "#f9f9f9" }}>
          <Card.Title className="border-bottom border-dark text-capitalize fw-light py-3 mb-0">{name}</Card.Title>
          <Card.Text className="border-bottom border-dark d-flex justify-content-between align-items-center py-2">
            <span className="price m-0 p-0 fs-4" style={{color: "#dd502d"}}>{price/10**18} cUSD</span>
            <span className="d-flex">
              {isOwner(index)}
            </span>
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
};

export default NftCard;