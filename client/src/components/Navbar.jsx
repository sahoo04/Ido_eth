import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomButton from './CustomButton';
import { logo, menu, search, thirdweb } from '../assets';
import { navlinks } from '../constants';
import { useStateContext } from '../context';

const Navbar = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState('dashboard');
    const [toggleDrawer, setToggleDrawer] = useState(false);
    const { address, connect, disconnect } = useStateContext(); // Use context

    return (
        <div className='flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6'>
            {/* Search Input and Other Elements */}
            <div className='sm:flex hidden flex-row justify-end gap-4'>
                <CustomButton
                    btntype='button'
                    title={address ? 'Logout' : 'Connect'}
                    styles={address ? 'bg-[#f44336]' : 'bg-[#8c6dfd]'}
                    handleClick={() => {
                        if (address) {
                            disconnect(); // Call disconnect if already connected
                        } else {
                            connect(); // Use connect function
                        }
                    }}
                />
                <Link to="/profile">
                    <div className='w-[52px] h-[52px] rounded-full bg-[#2c2f32] flex justify-center items-center cursor-pointer'>
                        <img src={thirdweb} alt="user" className='w-[60%] h-[60%] object-contain' />
                    </div>
                </Link>
            </div>

            {/* Mobile Menu and Other Elements */}
            <div className='sm:hidden flex justify-between items-center relative'>
                <img
                    src={menu}
                    alt='menu'
                    className='w-[34px] object-contain cursor-pointer'
                    onClick={() => setToggleDrawer(!toggleDrawer)}
                />
                <div className={`absolute top-[60px] right-0 left-0 bg-[#1c1c24] z-10 shadow-secondary py-4 transition-all duration-700 ${!toggleDrawer ? '-translate-y-[100vh]' : 'translate-y-0'}`}>
                    <ul className='mb-4'>
                        {navlinks.map((link) => (
                            <li
                                key={link.name}
                                className={`flex p-4 ${isActive === link.name ? 'bg-[#3a3a43]' : ''}`}
                                onClick={() => {
                                    setIsActive(link.name);
                                    setToggleDrawer(false);
                                    navigate(link.link);
                                }}
                            >
                                <p className={`ml-[20px] font-epilogue font-semibold text-[14px] ${isActive === link.name ? 'text-[#1dc071]' : 'text-[#808191]'}`}>
                                    {link.name}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className='flex mx-4'>
                        <CustomButton
                            btntype='button'
                            title={address ? 'Logout' : 'Connect'}
                            styles={address ? 'bg-[#f44336]' : 'bg-[#8c6dfd]'}
                            handleClick={() => {
                                if (address) {
                                    disconnect(); // Call disconnect if already connected
                                } else {
                                    connect(); // Use connect function
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
