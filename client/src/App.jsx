import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { CampaignDetails, CreateCampaign, Profile, Home } from "./pages";
import { Sidebar, Navbar } from "./components";

const App = () => {
  const navigate = useNavigate();

  // Function to handle when a campaign is clicked, navigating to the CampaignDetails page using title
  const handleCampaignClick = (campaignTitle) => {
    navigate(`/campaign-details/${encodeURIComponent(campaignTitle)}`); // Use title as unique identifier
  };

  return (
    <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row">
      {/* Sidebar, hidden on smaller screens */}
      <div className="sm:flex hidden mr-10 relative">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
        <Navbar />

        {/* Define application routes */}
        <Routes>
          <Route path="/" element={<Home onCampaignClick={handleCampaignClick} />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/campaign-details/:title" element={<CampaignDetails />} /> {/* Updated route to use title */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
