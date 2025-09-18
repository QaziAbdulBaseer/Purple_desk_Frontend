

import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import AuthService from './ApiClass/auth'  // Updated path
import { login, logout } from './store/authSlice'



import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()



  useEffect(() => {
    AuthService.GetCurrentUserForApp(dispatch)
    .then((userData) => {
      if (userData) {
        console.log("its running")
        // dispatch(login({userData}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])
  

  return !loading ? (

      <div>
        {/* <Navbar /> */}
        <main>
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
  ) : null
}

export default App