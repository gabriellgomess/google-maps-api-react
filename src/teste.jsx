import React, { useState } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import axios from 'axios';

const App = () => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: -29.835463, lng: -51.124084 });
  const [address, setAddress] = useState('');

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: address,
          key: 'AIzaSyC6U6f6HIJnA3WX9NtQ0n6fPA8cqWMjcbA'
        }
      });
      const location = response.data.results[0].geometry.location;
      setCenter(location);
      if (map) {
        map.panTo(location);
      }
    } catch (error) {
      console.error('Geocoding API error:', error);
    }
  };

  return (
    <div style={{ width: '100vw', height: '70vh' }}>
      <LoadScript
        googleMapsApiKey="AIzaSyC6U6f6HIJnA3WX9NtQ0n6fPA8cqWMjcbA"
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={13}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />

          <form onSubmit={handleAddressSubmit}>
            <input
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={handleAddressChange}
              style={{ width: '300px', height: '40px', marginTop: '10px' }}
            />
            <button type="submit">Locate</button>
          </form>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default App;
