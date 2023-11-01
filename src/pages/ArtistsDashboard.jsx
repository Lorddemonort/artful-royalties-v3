import React, { useState, useEffect } from 'react';

function ArtistsDashboard() {
    const [artworks, setArtworks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

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

    return (
        <div>
            <h1 className="text-2xl mb-4">Your Artworks</h1>
            
            <div className="mb-4">
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload} className="ml-2 bg-blue-500 text-white p-2 rounded">Upload Artwork</button>
            </div>
            
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
