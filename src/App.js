import './App.css';
import React from "react";
import { useState, useCallback } from 'react';
import Cover from "./components/Cover";
import {Notification} from "./components/ui/Notifications";
import Wallet from "./components/wallet";
import Nfts from "./components/minter";
import {Container, Nav} from "react-bootstrap";
import MyNFTAbi from "./contracts/MyNFT.json";
import MyNFTAddress from "./contracts/MyNFT-address.json";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import {create as ipfsHttpClient} from "ipfs-http-client";
import axios from "axios";
require('dotenv').config({path: '.env'});


function App() {
  
  

  const [address, setAddress] = useState(null);

  const web3 = createAlchemyWeb3(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY.toString()}`);
  const minterContract = new web3.eth.Contract(MyNFTAbi.abi, MyNFTAddress.MyNFT);
  const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
  

  
  


   const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(addressArray[0]);
        const obj = {
          status: "",
          address: addressArray[0],
        };
       
        return obj;
      } catch (err) {
        return {
          address: "",
          status: "😞" + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href="https://metamask.io/download.html">
                You must install MetaMask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };


  const addNFT = async (name, ipfsImage, description, address)=>{
     

     // convert NFT metadata to JSON format
     const data = JSON.stringify({
         name: name,
         image: ipfsImage,
         description: description,
         owner: address,
     });

     try {

         // save NFT metadata to IPFS
         const added = await client.add(data);

         // IPFS url for uploaded metadata
         const url = `https://ipfs.infura.io/ipfs/${added.path}`;

        
       
        // mint the NFT and save the IPFS url to the blockchain
         await minterContract.methods
         .mint(url)
         .send({ from: address });
         
       
     } catch (error) {
         console.log("Error uploading file: ", error);
     }

  }

  // get the metedata for an NFT from IPFS
 const fetchNftMeta = async (ipfsUrl) => {
  try {
      if (!ipfsUrl) return null;
      const meta = await axios.get(ipfsUrl);
      return meta;
  } catch (e) {
      console.log({e});
  }
};

  const getNfts = useCallback( async () => {
   
    try {
        const nfts = [];
        const nftsLength = await minterContract.methods.totalSupply().call();
        for (let i = 0; i < Number(nftsLength); i++) {
            const nft = new Promise(async (resolve) => {
                const res = await minterContract.methods.tokenURI(i).call();
                const meta = await fetchNftMeta(res);
                
                resolve({
                    index: i,
                    name: meta.data.name,
                    description: meta.data.description,
                    image: meta.data.image,
                    owner: meta.data.owner,
                });
            });
            nfts.push(nft);
        }
        return Promise.all(nfts);
    } catch (e) {
        console.log({e});
    }
});

  
  

   
  
     

    return (
        <>
            <Notification/>

            {address ? (
                <Container fluid="md">
                    <Nav className="justify-content-end pt-3 pb-5">
                        <Nav.Item>
                            {/*display user wallet*/}
                            <Wallet
                                address={address}
                            />
                        </Nav.Item>
                    </Nav>
                    <main>

                        {/*list NFTs*/}
                        <Nfts
                            addNFT={addNFT}
                            getNfts={getNfts}
                            name="NFT Minter"
                            minterContract={minterContract}
                            address={address} 
                        />
                    </main>
                </Container>
            ) : (
                //  if user wallet is not connected display cover page
                <Cover name="NFT MINTER" coverImg="https://www.cnet.com/a/img/resize/180806b9e13bc1d1750aeef34e28f173dc2ee7e3/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=940" connect={connectWallet}/>
            )}
        </>
    );
}

export default App;
