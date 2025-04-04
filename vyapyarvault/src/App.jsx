import { useState } from 'react'
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!file) {
        throw new Error('Please select a file first');
      }
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios({
        method: 'POST',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY
        }
      });
      const fileUrl = "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash;
      console.log(fileUrl);
    } catch (error) {
      console.error('Error uploading file:', error.response?.data || error.message);
    }
  };

  return (
    <>
      <div>
        <h1>IPFS</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={(e) => {setFile(e.target.files[0])}}/>
          <button type="submit">Upload</button>
        </form>
      </div>
    </>
  )
}

export default App
