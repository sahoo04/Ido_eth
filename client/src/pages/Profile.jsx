import React, { useEffect, useState } from 'react';
import { useStateContext } from '../context'; // Adjust the path as necessary
import { CustomButton } from '../components'; // Ensure CustomButton is imported if needed

const Profile = () => {
    const { getCampaigns, address } = useStateContext();
    const [userCampaigns, setUserCampaigns] = useState([]);

    useEffect(() => {
        const fetchUserCampaigns = async () => {
            try {
                // Fetch all campaigns from the smart contract
                const fetchedCampaigns = await getCampaigns();

                // Filter campaigns to get only those created by the connected wallet address
                const filteredCampaigns = fetchedCampaigns.filter(campaign => campaign.owner.toLowerCase() === address.toLowerCase());

                // Map through the filtered campaigns and ensure proper type conversions
                const formattedCampaigns = filteredCampaigns.map((campaign) => ({
                    ...campaign,
                    target: Number(campaign.target), // Convert BigInt to Number if necessary
                    deadline: Number(campaign.deadline), // Convert BigInt to Number if necessary
                }));

                // Update state with formatted campaigns
                setUserCampaigns(formattedCampaigns);
            } catch (error) {
                console.error("Error fetching user campaigns:", error);
            }
        };

        if (address) {
            fetchUserCampaigns(); // Only fetch campaigns if the user is connected
        }
    }, [getCampaigns, address]);

    return (
        <div className='bg-[#1c1c24] p-8 min-h-screen flex flex-col'>
            <h1 className='text-white text-3xl font-bold mb-8'>Your Campaigns</h1>
            {userCampaigns.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {userCampaigns.map((campaign, index) => (
                        <div key={index} className='bg-gray-800 bg-opacity-75 rounded-lg p-6 shadow-lg transition-transform transform hover:scale-105'>
                            {campaign.image && (
                                <img
                                    src={campaign.image} // Use the image field from campaign
                                    alt={campaign.title}
                                    className='w-full h-48 object-cover rounded-t-lg'
                                />
                            )}
                            <h2 className='text-xl text-white font-semibold mt-4'>{campaign.title}</h2>
                            <p className='text-gray-300 mt-2'>Description: {campaign.description}</p>
                            <p className='text-gray-300 mt-2'>Target: {campaign.target} ETH</p>
                            <p className='text-gray-300 mt-2'>Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}</p>
                            <p className='text-gray-300 mt-2'>Owner: {campaign.owner}</p> {/* Display the owner address */}
                            <div className='flex justify-center items-center mt-[20px]'>
                                <CustomButton
                                    title="View Campaign"
                                    styles="bg-[#1dc071] text-white py-2 px-4 rounded hover:bg-[#1c8e5a]"
                                    onClick={() => console.log(`View ${campaign.title}`)} // Add navigation or functionality as needed
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-white'>No campaigns available.</p>
            )}
        </div>
    );
};

export default Profile;
