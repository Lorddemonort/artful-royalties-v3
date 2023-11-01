import React from 'react';
import { Link } from 'react-router-dom';
import { trynow } from "../assets";
import { heroimage } from "../assets";

const Home = () => {
  return (
    <section className="max-w-7xl mx-auto">
        <div className="container mx-auto flex items-center justify-between py-1">
            <div className="">
                <h1 className="text-6xl font-bold text-gray-900 my-4">Generate Art using AI</h1>
                <Link to="/create-art" className="px-6 py-2 my-8 rounded">
                  <img src={trynow} alt="try-now-button" className='w-28 object-contain ml-30'/>
                </Link>
                <p className="text-lg text-gray-900 my-4">
                Empowering artists, <br></br> one creation at a time with Artful Royalties.
                </p>
                
            </div>
            <img src={heroimage} alt="hero" className="w-3/5"/>
        </div>
        <div>&copy; Artful Royalties - Project by Shafin Shaikh, Gandhar Date, Pranay Mohature and Advait Bhore</div>
    </section>
  )
}

export default Home