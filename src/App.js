import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import RestApi from './RestApi'
import RestApiQuestion from './RestApiQuestion'
import './App.css'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from './config'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')  

  useEffect(() => {
    // Fetch the user email and token from local storage
    const user = JSON.parse(localStorage.getItem('user'))

    // If the token/email does not exist, mark the user as logged out
    if (!user || !user.token) {
      setLoggedIn(false)
      return
    }
    const verifyUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/usermanagement/verify`, {
          method: 'POST',
          headers: {
            'Authorization': user.token,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          if (response.status === 403) {
            window.alert('Forbidden: You do not have permission to access this resource.');
            return;
          }
          window.alert('Network response was not ok: ' + response.statusText);
          return;
        }
  
        const data = await response.json();
  
        console.log('Response data', data);
        setLoggedIn(data.message === 'success');
        setEmail(user.email || '');
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };
    verifyUser();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
          <Route path="/restapi" element={<RestApi setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
          <Route path="/restapiquestion/:examId" element={<RestApiQuestion setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
