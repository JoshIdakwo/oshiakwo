import React from "react";
import { Nav } from "react-bootstrap";
import Wallet from "../Wallet";
import { useBalance } from "../../hooks";

const Navigation = ({ name, address, destroy }) => {
  const { balance } = useBalance();
  const navItem = [
    {name: "item", link: "#"},
    {name: "store", link: "#"},
    {name: "about", link: "#"},
  ]
  return (
    <Nav className="nav justify-content-between py-3 px-5 mb-3">
      <Nav.Item className="d-flex align-items-center gap-4">
        <p
          className="m-0 fs-4"
          style={{ color: "#dd502d" }}
        >
          {name}
        </p>
        {navItem.map((item, key) => (
          <li key={key} className="text-uppercase"><a style={{color: "#000"}} href={item.link}>{item.name}</a></li>
        ))}
      </Nav.Item>
      <Nav.Item>
        <Wallet
          address={address}
          amount={balance.CELO}
          symbol="CELO"
          destroy={destroy}
        />
      </Nav.Item>
    </Nav>
  )
}

export default Navigation;