import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from './config'

const Login = (props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const navigate = useNavigate()

  const onButtonClick = () => {
    setEmailError('')
    setPasswordError('')

    // Check if the user has entered both fields correctly
    if ('' === email) {
      setEmailError('Please enter your email')
      return
    }

    if (!/^[\w.-]+@[\w-]+\.[\w-]{2,4}$/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    

    if ('' === password) {
      setPasswordError('Please enter a password')
      return
    }

    if (password.length < 8) {
      setPasswordError('The password must be 8 characters or longer')
      return
    }

    // Authentication calls will be made here...
    checkAccountExists((accountExists) => {
      // If yes, log in
      if (accountExists) logIn()
      // Else, ask user if they want to create a new account and if yes, then log in
      else if (
        window.confirm(
          'An account does not exist with this email address: ' + email + '. Do you want to create a new account?',
        )
      ) {
        logIn()
      }
    })
  }

  // Call the server API to check if the given email ID already exists
  const checkAccountExists = (callback) => {
    fetch(`${API_BASE_URL}/usermanagement/check-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((data) => {
        callback(data)
      })
      .catch((error) => {
        console.error('Error during fetch:', error);
        callback(false); // oder eine andere Fehlerbehandlung
      });
  }

  // Log in a user using email and password
  const logIn = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usermanagement/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
  
      if (data.token) {
        localStorage.setItem('user', JSON.stringify({ email, token: data.token }));
        props.setLoggedIn(true);
        props.setEmail(email);
        navigate('/restapi');
      } else {
        window.alert('Wrong email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      window.alert('An error occurred during login. Please try again.');
    }
  };
  
  

  return (
    <div className={'mainContainer'}>
      <div className={'titleContainer'}>
        <div>Login</div>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={email}
          placeholder="Enter your email here"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{emailError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          type="password"
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{passwordError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input className={'inputButton'} type="button" onClick={onButtonClick} value={'Log in'} />
      </div>
    </div>
  )
}

export default Login
