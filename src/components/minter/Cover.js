import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

const Cover = ({ coverImg, connect }) => {
    return (
      <div className="cover d-flex align-items-center justify-content-center">
        <div className="cover-text">
          <h1 className="mb-5 font-weight-lighter">Replaced {"->"} <br/><span>&</span> Elegant</h1>
          <Button
            onClick={() => connect().catch((e) => console.log(e))}
            variant="outline-dark"
            className="rounded-pill px-5 py-3 mt-3"
            style={{ color: "brown" }}
          >
            Explore
          </Button>
        </div>
        <div
          className="cover-img"
          style={{ overflow: "hidden"}}
        >
          <img src={coverImg} alt="" />
        </div>
      </div>
    );
};

Cover.propTypes = {
  name: PropTypes.string,
};

Cover.defaultProps = {
  name: "",
};

export default Cover;