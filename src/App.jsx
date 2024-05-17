import React from 'react';
import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';
import { logo } from "./assets";
import { Home, CreateArt, ArtistLogin, CustomerLogin, ArtistsDashboard } from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <header className='w-full flex justify-between /*bg-[#c4f3f3]*/ bg-white  sma:px-8 sticky top-0 z-10 px-12 py-4 border-b border-gray-200 backdrop-filter backdrop-blur-lg bg-opacity-30'>
        <Link to="/">
          <img src={logo} alt="logo" className='w-28 object-contain'/>
        </Link>

        <div className="flex space-x-4">
            <Link to="/customer-login" className="ont-inter font-medium border border-gray-800 hover:bg-[#a2f1f1] px-4 py-2 rounded-full">User Login</Link>
            <Link to="/artist-login" className="ont-inter font-medium border border-gray-800 hover:bg-[#a2f1f1] px-4 py-2 rounded-full">Artist Login</Link>
        </div>
      </header>

      <main className='sm:p-8 px-4 py-8 w-full bg-gradient-to-r from-[#40baba] via-[#2591B9] to-[#393939] min-h-[calc(100vh-73px)]'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" />} />
          <Route path="/create-art" element={<CreateArt />} />
          <Route path="/artist-login" element={<ArtistLogin />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/artists-dashboard" element={<ArtistsDashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App;
