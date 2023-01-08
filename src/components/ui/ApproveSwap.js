import React, { useEffect, useState } from "react";
import { getNft } from "../../utils/minter";
import { Button, Modal, Form } from "react-bootstrap";
import { truncateAddress } from "../../utils";
import Identicon from "./Identicon";

const ApproveSwap = ({ style2, minterContract, approve, swapReq }) => {
  const [show, setShow] = useState(false);
  const [nft, setNfts] = useState({});

  
  // display the popup modal
  const handleShow = () => setShow(true);
  // close the popup modal
  const handleClose = () => setShow(false);

  const nftData = async() => {
    try{
      const requester = await minterContract.methods.requests(style2).call();
      const swapReq = await minterContract.methods.swaps(requester).call();
      const {giveStyle} = swapReq;
      const data = await getNft(minterContract, giveStyle);
      if (!data) return;
      setNfts(data);
    } catch(err) {
      console.log(err)
    }
  }


  useEffect(() => {
    try {
      nftData();
    } catch (error) {
      console.log({ error });
    }
  }, []);

  return (
    <>
      <p className="px-2 py-1 m-0 fw-bold" onClick={handleShow}>Approve Swap</p>
      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Approve Swap</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <Form>
            {show ? (
              <div className="card h-100">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <Identicon address={nft.owner} size={28} />
                    <span className="mx-2 font-monospace text-secondary">
                      {truncateAddress(nft.owner)}
                    </span>
                    <div className="bg-secondary text-white px-2 rounded ms-auto">
                      {nft.index} ID
                    </div>
                  </div>
                </div>

                <div className="img-container ratio ratio-21x9">
                  <img src={nft.image} alt={nft.name} style={{ objectFit: "contain" }} />
                </div>

                <div className="card-body d-flex flex-column text-center pt-0" style={{ backgroundColor: "#f9f9f9" }}>
                  <h2 className="border-bottom border-dark text-capitalize fw-light py-3 mb-0">{nft.name}</h2>
                  <p className="border-bottom border-dark d-flex justify-content-center align-items-center py-2">
                    <span className="price m-0 p-0 fs-4" style={{color: "#dd502d"}}>{nft.price/10**18} cUSD</span>
                  </p>
                </div>
              </div>
            ) : (
              ""
            )}
          </Form>
        </Modal.Body>
  
        <Modal.Footer>
          <Button variant="outline-dark" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            onClick={()=> {
              approve();
              handleClose();
            }}>
            Swap
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
  
export default ApproveSwap;