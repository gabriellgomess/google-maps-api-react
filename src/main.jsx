import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {APIProvider} from '@vis.gl/react-google-maps';

ReactDOM.createRoot(document.getElementById('root')).render(
  <APIProvider apiKey={'AIzaSyC6U6f6HIJnA3WX9NtQ0n6fPA8cqWMjcbA'} onLoad={() => console.log('Maps API has loaded.')}>
    <App />
  </APIProvider>
  
    

)
