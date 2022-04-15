import React from 'react'
import './App.css'
import HeaderWalletConnect from './components/header'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Link } from 'react-router-dom'
import HomeScreen from './pages/home'
import CreateOrderScreen from './pages/create-order'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <HeaderWalletConnect />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/create-order/:tokenAddress/:tokenId" element={<CreateOrderScreen />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
