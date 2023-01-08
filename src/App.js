import React from "react";
import { Container } from "react-bootstrap";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Notification } from "./components/ui/Notifications";
import Cover from "./components/minter/Cover";
import Nfts from "./components/minter/nfts";
import { useBalance, useMinterContract } from "./hooks";
import Navigation from "./components/ui/Navigation"
import "./App.css";
import coverImg from "./assets/ankara.jpeg";

const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();
  const { getBalance } = useBalance();
  const minterContract = useMinterContract();

  return (
    <>
      <Notification />
      {address ? (
        <Container fluid="md">
        <Navigation name="IDOKO" destroy={destroy} address={address} />
          <main>
            <Nfts
              name="IDOKO Collection"
              updateBalance={getBalance}
              minterContract={minterContract}
            />
          </main>
        </Container>
      ) : (
        <>
          <Navigation name="IDOKO" destroy={destroy} address={address} />
          <Cover coverImg={coverImg} connect={connect} />
        </>
      )}
    </>
  );
};

export default App;