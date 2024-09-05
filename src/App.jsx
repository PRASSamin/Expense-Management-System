import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/home/home'
import Login from './components/authentication/login'
import Register from './components/authentication/registration'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/dashboard' element={<Home activeTab={"dashboard"}/>}></Route>
      <Route path='/incomes' element={<Home activeTab={"incomes"}/>}></Route>
      <Route path='/expenses' element={<Home activeTab={"expenses"}/>}></Route>
      <Route path='/accounts' element={<Home activeTab={"accounts"}/>}></Route>
      <Route path='/reports' element={<Home activeTab={"reports"}/>}></Route>
      <Route path='/' element={<Home activeTab={"dashboard"}/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/register' element={<Register/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
