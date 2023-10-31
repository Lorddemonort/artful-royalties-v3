import React, { useState, useEffect } from 'react';

function ArtistsDashboard() {
    const [artworks, setArtworks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        // Fetch artworks of the logged-in artist from the backend
        const fetchedArtworks = [
            // Placeholder data
            { imageUrl: "path_to_art1.jpg", timesUsed: 5 },
            { imageUrl: "path_to_art2.jpg", timesUsed: 3 },
            // ... more artworks
        ];
        setArtworks(fetchedArtworks);
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
            const response = await fetch('/api/upload-artwork', {
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
