import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import axios from "axios";
import { ethers } from "ethers"

function getAccessToken () {
  return process.env.REACT_APP_STORAGE_API_KEY;
}

function makeStorageClient () {
  return new Web3Storage({ token: getAccessToken() })
}

function makeFileObjects (file, fileName) {
  const blob = new Blob([file], { type: 'application/json' })
  const files = [
    new File([blob], `${fileName}`)
  ]
  return files;
}

async function storeFiles (files) {
  const client = makeStorageClient()
  const cid = await client.put(files)
  return cid
}

export const createNft = async (
    minterContract,
    performActions,
    { name, ipfsImage, price }
  ) => {
    await performActions(async (kit) => {
      if (!name || !price || !ipfsImage) return;
      const { defaultAccount } = kit;
  
      // convert NFT metadata to JSON format
      const data = JSON.stringify({
        name,
        price,
        image: ipfsImage,
      });
  
      try {
         // save NFT metadata to IPFS
        let fileName = name;
        if(fileName.includes(" ")) fileName = fileName.replaceAll(" ", "%20");

        const fileObj = await makeFileObjects(data, name); 
        const fileCid = await storeFiles(fileObj);

        // IPFS url for uploaded metadata
        const url = `https://${fileCid}.ipfs.w3s.link/${fileName}`
        const _price = ethers.utils.parseUnits(String(price), "ether");

        // mint the NFT and save the IPFS url to the blockchain
        const transaction = await minterContract.methods
          .storeStyle(name, _price, url)
          .send({ from: defaultAccount });

        return transaction;
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    });
  };

  export const uploadFileToWebStorage = async (e) => {
    // Construct with token and endpoint
    const client = await makeStorageClient();
  
    const file = e.target.files;
    const fileName = file[0].name
    if (!file) return;
    // Pack files into a CAR and send to web3.storage
    const rootCid = await client.put(file) // Promise<CIDString>

    if(file[0].type === "image/png") {
      let name = fileName.trim();
      if(name.includes(" ")) {
        name = name.replaceAll(" ", "%20");
      }
      return `https://${rootCid}.ipfs.w3s.link/${name}`;
    }

    const res = await client.get(rootCid) // Promise<Web3Response | null>
    const files = await res.files() // Promise<Web3File[]>
  
    return `https://${files[0].cid}.ipfs.w3s.link/`;
  };

  export const getNfts = async (minterContract) => {
    try {
      const nfts = [];
      const nftsLength = await minterContract.methods.totalSupply().call();
      for (let i = 0; i < Number(nftsLength); i++) {
        const nft = new Promise(async (resolve) => {
          const res = await minterContract.methods.tokenURI(i).call();
          const meta = await fetchNftMeta(res);
          const oshiakwo = await minterContract.methods.getStyles(i).call();
          resolve({
            index: i,
            owner: oshiakwo[0],
            name: meta.data.name,
            image: meta.data.image,
            price: oshiakwo[2],
            sold: oshiakwo[3],
            swapRequest: oshiakwo[4],
            fav: oshiakwo[5],
          });
        });
        nfts.push(nft);
      }
      return Promise.all(nfts);
    } catch (e) {
      console.log({ e });
    }
  };

  export const getNft = async(minterContract, index) => {
    try {
      const nft = new Promise(async (resolve) => {
        const res = await minterContract.methods.tokenURI(index).call();
        const meta = await fetchNftMeta(res);
        const oshiakwo = await minterContract.methods.getStyles(index).call();
        resolve({
          index,
          owner: oshiakwo[0],
          name: meta.data.name,
          image: meta.data.image,
          price: oshiakwo[2],
          sold: oshiakwo[3],
          swapRequest: oshiakwo[4]
        });
      });
      return nft;
    } catch (e) {
      console.log({ e });
    }
  }

  export const fetchNftMeta = async (ipfsUrl) => {
    try {
      if (!ipfsUrl) return null;
      const meta = await axios.get(ipfsUrl);
      return meta;
    } catch (e) {
      console.log({ e });
    }
  };

  export const requestNftSwap = async (performActions, minterContract, style1, style2) => {
    try {
      await performActions(async (kit) => {
        const {defaultAccount} = kit;
        
        await minterContract.methods.requestSwap(style1, style2).send({ from: defaultAccount });
      })
    } catch(e) {
      console.log(e);
    }
  }

  export const swapNft = async (performActions, minterContract, style1, style2) => {
    try {
      await performActions( async(kit)=> {
        const {defaultAccount} = kit;
        await minterContract.methods.approveSwap(style1, style2).send({from: defaultAccount});
      })
    } catch(e) {
      console.log(e);
    }
  }

  export const buyNft = async (performActions, minterContract, tokenId) => {
    try {
      await performActions(async (kit) => {
        const {defaultAccount} = kit;
        const oshiakwo = await minterContract.methods.getStyles(tokenId).call();
        await minterContract.methods.buyStyle(tokenId).send({from: defaultAccount, value: oshiakwo[2] });
        getNfts(minterContract);
      })
    } catch(e) {
      console.log(e)
    }
  }

  export const isFav = async (performActions, minterContract, tokenId) => {
    try {
      await performActions(async (kit) => {
        const {defaultAccount} = kit;
        await minterContract.methods.favStyle(tokenId).send({from: defaultAccount});
      })
    } catch(e) {
      console.log(e)
    }
  }
