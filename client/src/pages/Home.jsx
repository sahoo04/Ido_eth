import React, { useEffect, useState } from 'react';
import { useStateContext } from '../context';
import Web3 from 'web3';

const Home = () => {
    const {
        getCampaigns, // Function to fetch campaigns
        donateToCampaign, // Function to handle donations
    } = useStateContext();

    const [campaigns, setCampaigns] = useState([]); // Store campaigns
    const [searchTitle, setSearchTitle] = useState(''); // Store search input
    const [filteredCampaigns, setFilteredCampaigns] = useState([]); // Store filtered campaigns
    const [donationAmounts, setDonationAmounts] = useState({});
    const [donationLoading, setDonationLoading] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [fetchingCampaigns, setFetchingCampaigns] = useState(false);

    // Function to initialize contract and fetch campaign data
    const initializeContract = async () => {
        setFetchingCampaigns(true);
        try {
            const fetchedCampaigns = await getCampaigns();
            const sortedCampaigns = fetchedCampaigns.sort((a, b) => {
                const dateA = new Date(Number(a.deadline) * 1000);
                const dateB = new Date(Number(b.deadline) * 1000);
                return dateB - dateA;
            });

            setCampaigns(sortedCampaigns);
            setFilteredCampaigns(sortedCampaigns); // Default filtered campaigns
        } catch (err) {
            console.error("Error initializing contract or fetching campaigns:", err);
        } finally {
            setFetchingCampaigns(false);
        }
    };

    useEffect(() => {
        initializeContract();
    }, []);

    // Handle donation logic
    const handleDonate = async (id) => {
        const donationAmount = donationAmounts[id];
        if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
            alert("Please enter a valid amount to donate.");
            return;
        }

        const amountInWei = Web3.utils.toWei(donationAmount, 'ether');
        setDonationLoading(id);
        setSuccessMessage('');

        try {
            const receipt = await donateToCampaign(id, amountInWei);

            if (receipt && receipt.status) {
                setSuccessMessage(`Successfully donated ${donationAmount} ETH to campaign ID ${id}!`);
                await initializeContract();
                setDonationAmounts((prevState) => ({ ...prevState, [id]: '' }));
            } else {
                alert("Donation failed or was canceled.");
            }
        } catch (error) {
            console.error("Error during donation:", error);
            alert("Donation failed. Check the console for details.");
        } finally {
            setDonationLoading(null);
        }
    };

    // Handle campaign search by title
    const handleSearchByTitle = (title) => {
        if (!title) {
            setFilteredCampaigns(campaigns);
            return;
        }

        const filtered = campaigns.filter((campaign) =>
            campaign.title.toLowerCase().includes(title.toLowerCase())
        );

        setFilteredCampaigns(filtered);
    };

    // Check if the campaign is closed
    const isCampaignClosed = (campaign) => {
        const currentAmount = Web3.utils.fromWei(campaign.currentAmount || '0', 'ether');
        const targetAmount = Web3.utils.fromWei(campaign.target || '0', 'ether');
        const deadline = new Date(Number(campaign.deadline) * 1000);
        const currentDate = new Date();
        return currentAmount >= targetAmount || currentDate > deadline;
    };

    return (
        <div className="bg-[#1c1c24] p-8 min-h-screen flex flex-col">
            <h1 className="text-white text-3xl font-bold mb-8">Campaigns</h1>

            {/* Stylish search bar */}
            <div className="mb-8 flex justify-center items-center">
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTitle}
                    onChange={(e) => {
                        setSearchTitle(e.target.value);
                        handleSearchByTitle(e.target.value);
                    }}
                    className="bg-[#2a2a38] text-white placeholder-gray-400 px-4 py-2 rounded-l-lg border border-[#444] focus:ring-2 focus:ring-[#1dc071] focus:outline-none"
                />
                <button
                    className="bg-[#1dc071] text-white px-4 py-2 rounded-r-lg hover:bg-[#16a65e] transition-all"
                    onClick={() => handleSearchByTitle(searchTitle)}
                >
                    Search
                </button>
            </div>

            {fetchingCampaigns && <p className="text-white">Fetching latest campaigns...</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            {/* Campaign cards */}
            {filteredCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign, index) => (
                        <div
                            key={campaign.id || index}
                            className={`bg-[#2a2a38] rounded-lg p-6 shadow-md flex flex-col items-center text-center ${
                                isCampaignClosed(campaign) ? 'opacity-50' : ''
                            }`}
                        >
                            {/* Circular image */}
                            {campaign.image && (
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                                    <img
                                        src={campaign.image}
                                        alt={campaign.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <h2 className="text-xl text-white font-semibold mt-4">{campaign.title}</h2>
                            <p className="text-gray-300 mt-2 text-sm">Created by: {campaign.owner}</p>
                            <p className="text-gray-300 mt-2 text-sm">{campaign.description}</p>
                            <p className="text-gray-300 mt-2 text-sm">
                                Target: {Web3.utils.fromWei(campaign.target || '0', 'ether')} ETH
                            </p>
                            <p className="text-gray-300 mt-2 text-sm">
                                Raised: {Web3.utils.fromWei(campaign.currentAmount || '0', 'ether')} ETH
                            </p>
                            <p className="text-gray-300 mt-2 text-sm">
                                Number of Donations: {campaign.numDonations || 0}
                            </p>
                            <p className="text-gray-300 mt-2 text-sm">
                                Deadline: {new Date(Number(campaign.deadline) * 1000).toLocaleDateString()}
                            </p>

                            <p
                                className={`text-${
                                    isCampaignClosed(campaign) ? 'red' : 'green'
                                }-500 mt-2 font-semibold`}
                            >
                                {isCampaignClosed(campaign) ? 'Closed' : 'Open'}
                            </p>

                            {!isCampaignClosed(campaign) && (
                                <>
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={donationAmounts[index] || ''}
                                        onChange={(e) =>
                                            setDonationAmounts((prevState) => ({
                                                ...prevState,
                                                [index]: e.target.value,
                                            }))
                                        }
                                        className="border border-gray-600 rounded px-2 py-1 mt-4 w-full"
                                    />
                                    <button
                                        onClick={() => handleDonate(index)}
                                        disabled={donationLoading === index}
                                        className={`bg-[#1dc071] text-white py-2 px-4 rounded mt-4 w-full ${
                                            donationLoading === index ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {donationLoading === index ? 'Processing...' : 'Contribute'}
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-white">No campaigns available.</p>
            )}
        </div>
    );
};

export default Home;
