import React, { useState, useEffect } from 'react';

function ArtistsDashboard() {
    const [artworks, setArtworks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [styleDescription, setStyleDescription] = useState(''); // New state for style description
    const [tokenBalance, setTokenBalance] = useState(0); // New state for token balance
    const [artistName, setArtistName] = useState(''); // New state for artist's name


    useEffect(() => {
        // Fetch artworks of the logged-in artist from the backend
        const fetchArtworks = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/get-artworks', {
                    headers: {
                      'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setArtworks(data.artworks);
                } else {
                    console.error("Failed to fetch artworks:", data.message);
                }
            } catch (error) {
                console.error("Error fetching artworks:", error);
            }
        };
    
        fetchArtworks();
    }, []);

    useEffect(() => {
        // Fetch artworks and token balance of the logged-in artist from the backend
        const fetchArtistData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/get-artist-data', {
                    headers: {
                      'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setArtworks(data.artworks);
                    setTokenBalance(data.tokenBalance); // Set the token balance
                    setArtistName(data.name); // Set the artist's name
                } else {
                    console.error("Failed to fetch artist data:", data.message);
                }
            } catch (error) {
                console.error("Error fetching artist data:", error);
            }
        };
    
        fetchArtistData();
    }, []);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        // Upload the file to your backend
        const formData = new FormData();
        formData.append('artwork', selectedFile);

        try {
            // Make sure to update the endpoint URL
            const response = await fetch('http://localhost:5000/api/upload-artwork', {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setArtworks([...artworks, data.artwork]);
            } else {
                console.error("Upload failed:", data.message);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    const handleUpdateStyleDescription = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/update-style', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                body: JSON.stringify({ styleDescription })
            });

            const data = await response.json();
            if (data.success) {
                alert("Style description updated successfully!");
            } else {
                console.error("Update failed:", data.message);
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl mb-4">Welcome, {artistName}</h1> {/* Display the welcome message with artist's name */}
            <h1 className="text-2xl mb-4">Your Artworks</h1>
            
            <div className="mb-4">
                <div className="text-lg">Token Balance: {tokenBalance}</div> {/* Display token balance */}
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload} className="ml-2 bg-blue-500 text-white p-2 rounded">Upload Artwork</button>
            </div>
            
            <div className="mb-4">
                <textarea 
                    value={styleDescription} 
                    onChange={(e) => setStyleDescription(e.target.value)}
                    placeholder="Describe your art style..."
                    className="w-full p-2 border rounded-md"
                />
                <button onClick={handleUpdateStyleDescription} className="mt-2 bg-blue-500 text-white p-2 rounded">Update Style Description</button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {artworks.map((art, index) => (
                    <div key={index}>
                        <img src={art.imageUrl} alt="Artwork" className="w-full h-full object-cover rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ArtistsDashboard;
