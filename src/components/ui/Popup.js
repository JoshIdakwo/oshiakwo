import React, { useState } from "react";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const PopUp = ({ data }) => {
  const [show, setShow] = useState(false);
  const [style2, setStyle2] = useState("");

  // check if all form popup_data has been filled
  const isFormFilled = () => style2;
  // close the popup modal
  const handleClose = () => setShow(false);;
    // display the popup modal
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        onClick={handleShow}
        variant="outline-dark"
      >
        Swap
      </Button>

        {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Swap NFT</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <Form>
            <FloatingLabel
              controlId="inputLocation"
              label="Desired NFT ID"
              className="mb-3"
            >
              <Form.Control
                type="number"
                placeholder="Desired NFT ID"
                onChange={(e) => {
                  setStyle2(e.target.value);
                }}
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>
  
        <Modal.Footer>
          <Button variant="outline-dark" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              data({
                style2
              });
              handleClose();
            }}
          >
            Request swap
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
  
export default PopUp;