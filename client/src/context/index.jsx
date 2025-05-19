import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import Web3 from "web3";
import ABI from './ABI.json';

const StateContext = createContext();
const contractAddress = "0x7EfC444Fd01c32902e5ec3288a5d5DE0ccF7B154";

const StateContextProvider = ({ children }) => {
    const [address, setAddress] = useState(localStorage.getItem("address") || null);
    const [loading, setLoading] = useState(false);
    const [web3Loading, setWeb3Loading] = useState(true);
    const [error, setError] = useState(null);
    const web3Ref = useRef(null);
    const contractRef = useRef(null);

    // Initialize Web3 and Contract
    useEffect(() => {
        const initWeb3 = async () => {
            setWeb3Loading(true);
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: "eth_requestAccounts" });
                    web3Ref.current = new Web3(window.ethereum);
                    contractRef.current = new web3Ref.current.eth.Contract(ABI, contractAddress);

                    console.log("Web3 initialized:", web3Ref.current);
                    console.log("Contract initialized:", contractRef.current);

                    setWeb3Loading(false);
                } catch (error) {
                    setError("Failed to initialize Web3. Please try again.");
                    console.error("Web3 Initialization Error:", error);
                    setWeb3Loading(false);
                }
            } else {
                setError("MetaMask not found. Please install it to use this feature.");
                setWeb3Loading(false);
            }
        };

        initWeb3();

        const handleAccountsChanged = (accounts) => {
            if (accounts.length > 0) {
                setAddress(accounts[0]);
                localStorage.setItem("address", accounts[0]);
                console.log("Account connected:", accounts[0]);
            } else {
                disconnect();
            }
        };

        const handleChainChanged = () => window.location.reload();

        window.ethereum?.on("accountsChanged", handleAccountsChanged);
        window.ethereum?.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum?.removeListener("chainChanged", handleChainChanged);
        };
    }, []);

    // Connect wallet
    const connect = useCallback(async () => {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setAddress(accounts[0]);
            localStorage.setItem("address", accounts[0]);
            console.log("Wallet connected:", accounts[0]);
        } catch (error) {
            setError("Could not connect to wallet.");
            console.error("Connection Error:", error);
        }
    }, []);

    // Disconnect wallet
    const disconnect = useCallback(() => {
        setAddress(null);
        localStorage.removeItem("address");
        console.log("Wallet disconnected");
    }, []);

    // Create a campaign
    const createCampaign = useCallback(async (campaignData) => {
        if (!contractRef.current) {
            setError("Contract not initialized. Please try reconnecting.");
            console.error("Contract is not initialized.");
            return;
        }

        const { title, description, target, deadline, image } = campaignData;

        try {
            setLoading(true);
            console.log("Creating campaign with data:", campaignData);
            await contractRef.current.methods.createCampaign(address, title, description, target, deadline, image)
                .send({ from: address });
            console.log("Campaign created successfully");
        } catch (error) {
            setError("Failed to create campaign.");
            console.error("Create Campaign Error:", error);
        } finally {
            setLoading(false);
        }
    }, [address]);

    // Get campaigns
    const getCampaigns = useCallback(async () => {
        if (!contractRef.current) {
            setError("Contract not initialized. Please try reconnecting.");
            console.error("Contract is not initialized.");
            return [];
        }

        try {
            setLoading(true);
            console.log("Fetching campaigns");
            const campaigns = await contractRef.current.methods.getCampaigns().call();
            console.log("Campaigns fetched successfully:", campaigns);
            return campaigns;
        } catch (error) {
            setError("Failed to load campaigns.");
            console.error("Get Campaigns Error:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Donate to a campaign
   // In StateContextProvider
const donateToCampaign = useCallback(async (id, amountInWei) => {
    if (!contractRef.current) {
        setError("Contract not initialized. Please try reconnecting.");
        console.error("Contract is not initialized.");
        return null; // Return null to handle this case properly in Home.jsx
    }

    try {
        setLoading(true);
        console.log("Donating to campaign:", { id, amountInWei, from: address });
        const receipt = await contractRef.current.methods.donateToCampaign(id)
            .send({ from: address, value: amountInWei });
        console.log("Donation transaction receipt:", receipt);
        return receipt;  // Ensure receipt is returned here
    } catch (error) {
        setError("Failed to donate to campaign.");
        console.error("Donation Error:", error);
        return null; // Return null in case of error
    } finally {
        setLoading(false);
    }
}, [address]);


    if (web3Loading) {
        return <p className="text-white">Initializing Web3...</p>;
    }

    return (
        <StateContext.Provider value={{
            address,
            connect,
            disconnect,
            createCampaign,
            getCampaigns,
            donateToCampaign,
            loading,
            error,
        }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
export default StateContextProvider;
