import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import { useStateContext } from '../context';
import { money } from '../assets';
import { CustomButton, FormField } from '../components';
import { checkIfImage } from '../utils';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { address, createCampaign } = useStateContext();
    const web3 = new Web3(window.ethereum);

    const [form, setForm] = useState({
        name: '',
        title: '',
        description: '',
        target: '',
        deadline: '',
        image: ''
    });

    const handleFormFieldChange = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!form.name || !form.title || !form.description || !form.target || !form.deadline || !form.image) {
            alert("Please fill in all fields.");
            return;
        }
        if (isNaN(form.target) || Number(form.target) <= 0) {
            alert("Target must be a positive number.");
            return;
        }

        if (!address) {
            alert("Please connect your wallet first!");
            return;
        }

        console.log("Creating campaign with form data:", form);

        checkIfImage(form.image, async (exists) => {
            if (exists) {
                setIsLoading(true);
                const campaignData = {
                    ...form,
                    target: web3.utils.toWei(form.target, 'ether'), // Convert target to wei
                    deadline: Math.floor(new Date(form.deadline).getTime() / 1000), // Convert date to Unix timestamp
                    owner: address // Pass the wallet address as the owner
                };
                try {
                    await createCampaign(campaignData);
                    navigate('/'); // Navigate to home on success
                } catch (error) {
                    alert("Error creating campaign: " + error.message);
                    console.error("Error creating campaign:", error);
                } finally {
                    setIsLoading(false); // Ensure loading state is reset
                }
            } else {
                alert('Please provide a valid image URL');
                setForm({ ...form, image: '' });
            }
        });
    };

    return (
        <div className='bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10'>
            {isLoading && <p>Loading...</p>}
            <div className='flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]'>
                <h1 className='font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white'>
                    Let's Start
                </h1>
            </div>
            <form onSubmit={handleSubmit} className='w-full mt-[65px] flex flex-col gap-[30px]'>
                <div className='flex flex-wrap gap-[40px]'>
                    <FormField
                        labelName="Your Name*"
                        placeholder="Your name"
                        inputType="text"
                        value={form.name}
                        handleChange={(e) => handleFormFieldChange('name', e)}
                    />
                    <FormField
                        labelName="Campaign Title*"
                        placeholder="Campaign title"
                        inputType="text"
                        value={form.title}
                        handleChange={(e) => handleFormFieldChange('title', e)}
                    />
                </div>

                <FormField
                    labelName="Story*"
                    placeholder="Campaign story"
                    isTextArea
                    value={form.description}
                    handleChange={(e) => handleFormFieldChange('description', e)}
                />
                <div className='w-full flex justify-start items-center p-4 bg-[#baee43] h-[120px] rounded-[10px]'>
                    <img src={money} alt="money" className='w-[40px] h-[40px] object-contain' />
                    <h4 className='font-epilogue font-bold text-[25px] text-white ml-[20px]'>
                        You will get 90% of the raised amount
                    </h4>
                </div>

                <div className='flex flex-wrap gap-[40px]'>
                    <FormField
                        labelName="Goal*"
                        placeholder="ETH goal"
                        inputType="text"
                        value={form.target}
                        handleChange={(e) => handleFormFieldChange('target', e)}
                    />
                    <FormField
                        labelName="End Date*"
                        placeholder="End date"
                        inputType="date"
                        value={form.deadline}
                        handleChange={(e) => handleFormFieldChange('deadline', e)}
                    />
                </div>
                <FormField
                    labelName="Campaign Image*"
                    placeholder="Image URL"
                    inputType="url"
                    value={form.image}
                    handleChange={(e) => handleFormFieldChange('image', e)}
                />

                <div className='flex justify-center items-center mt-[40px]'>
                    <CustomButton
                        btntype="submit"
                        title="Submit"
                        styles={`bg-[#1dc071] ${!address ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!address}
                    />
                </div>
            </form>
        </div>
    );
};

export default CreateCampaign;
