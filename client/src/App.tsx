import { Routes, Route, BrowserRouter } from "react-router-dom"
import Sender from "./pages/sender"
import Receiver from "./pages/receiver"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element = {< Sender />}></Route>
        <Route path="/receiver" element= {< Receiver />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
