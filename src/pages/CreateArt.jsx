import React, { useState } from 'react';

function CreateArt() {
    const [prompt, setPrompt] = useState('');
    const [tokenBalance, setTokenBalance] = useState(100); // Example initial value
    const [history, setHistory] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleGenerateArt = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/generate-art', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ textPrompts: prompt })
            });

            const data = await response.json();
            if (data.success) {
                // Handle the generated images (e.g., display them or save their URLs)
                setHistory(prev => [...data.images.map(url => ({ imageUrl: url, cost: 10 })), ...prev]);
                setTokenBalance(prev => prev - 10);  // Assuming a fixed cost for now
            } else {
                console.error("Art generation failed:", data.message);
            }
        } catch (error) {
            console.error("Art generation error:", error);
        }
    };

    const artists = [  // Placeholder data
        { name: "Sam Does Art", imageUrl: "src/assets/samdoesart.jpg" },
        { name: "Lemonade Art", imageUrl: "src/assets/lemonadeart.png" },
        { name: "Hotfrost", imageUrl: "src/assets/hotfrost.jpg" },
        { name: "Azekeil 3d", imageUrl: "src/assets/azeikel.png" },
        // ... (more artists)
    ];

    const suggestedArtists = artists.slice(0, 2);

    const handleSearch = (term) => {
        if (!term) {
            setSearchResults(suggestedArtists);
        } else {
            const results = artists.filter(artist => artist.name.toLowerCase().includes(term.toLowerCase()));
            setSearchResults(results);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <div className="p-3 bg-[#cedada] text-black rounded-md">
                User Token Balance: {tokenBalance}
            </div>
            
            {/* Main Content */}
            <div className="flex-grow flex">
                {/* History Column */}
                <div className="w-1/4 overflow-y-auto">
                    <div>
                        <div className='text-black justify-center align-middle my-5 mx-16 font-bold text-xl'><h2 >Your Creations-</h2></div>
                    {history.map((art, index) => (
                        <div key={index} className="p-2 border-b">
                            <img src={art.imageUrl} alt="Generated Art" className="w-full h-32 object-cover" />
                            <div>Cost: {art.cost}</div>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Central Image Display and Prompt */}
                <div className="w-1/2 flex flex-col items-center p-4">
                    <div className="flex-grow bg-gray-300 w-full rounded-md h-10"></div> {/* Placeholder for the generated image */}
                    <div className="flex mt-4 w-full">
                        <input 
                            type="text" 
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)} 
                            className="flex-grow p-2 border rounded-md"
                            placeholder="Enter your prompt..."
                        />
                        <button 
                            onClick={handleGenerateArt} 
                            className="ml-2 bg-blue-500 text-white p-2 rounded-md"
                        >Dream</button>
                    </div>
                </div>

                {/* Artist Column */}
                <div className="w-1/4 p-4">
                    <div className="mb-4">
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            onFocus={() => handleSearch('')}
                            placeholder="Search for artists..."
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    
                    {searchResults.map((artist, index) => (
                        <div key={index} className="mb-4">
                            <div className="font-bold">{artist.name}</div>
                            <img src={artist.imageUrl} alt={`Preview of ${artist.name}`} className="w-full h-40 object-cover rounded-md mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CreateArt;
