import { useContract } from "./useContract";
import MyNFTAbi from "../contracts/Oshiakwo.json";
import MyNFTContractAddress from "../contracts/Oshiakwo-address.json";

export const useMinterContract = () =>
  useContract(MyNFTAbi.abi, MyNFTContractAddress.Oshiakwo);