import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/home/home'
import Login from './components/authentication/login'
import Register from './components/authentication/registration'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/register' element={<Register/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
