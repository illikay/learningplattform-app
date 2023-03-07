import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


const App = () => {
   const [posts, setPosts] = useState([]);
   const [data, setData] = useState([]);
   useEffect(() => {
  fetch('http://localhost:7634/exam')
    .then(response => response.json())
    .then(data => setData(data))
    .catch(error => console.error(error));
}, []);
   
   return (
    <div>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.pruefungsName} , {item.info} , {item.beschreibung} , {item.erstellDatum} , 
          {item.aenderungsDatum} , {item.anzahlFragen} </li>
          ))}          
      </ul>
    </div>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root')).render(<App />)
