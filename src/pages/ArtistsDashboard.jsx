// ArtistsDashboard.jsx

import React, { useState, useEffect } from 'react';

function ArtistsDashboard() {
    const [artworks, setArtworks] = useState([]);

    useEffect(() => {
        // Fetch artworks of the logged-in artist from the backend
        // For demonstration, I'll just use a placeholder
        const fetchedArtworks = [
            // Placeholder data
            { imageUrl: "path_to_art1.jpg", timesUsed: 5 },
            { imageUrl: "path_to_art2.jpg", timesUsed: 3 },
            // ... more artworks
        ];
        setArtworks(fetchedArtworks);
    }, []);

    return (
        <div>
            <h1 className="text-2xl mb-4">Your Artworks</h1>
            <div className="grid grid-cols-3 gap-4">
                {artworks.map((art, index) => (
                    <div key={index}>
                        <img src={art.imageUrl} alt="Artwork" className="w-full h-40 object-cover rounded-md" />
                        <p className="mt-2">Used: {art.timesUsed} times</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ArtistsDashboard;
