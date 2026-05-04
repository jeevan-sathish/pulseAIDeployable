import { Route, Routes } from "react-router-dom";
import Prediction from "./components/Prediction";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./components/Home";

const App = () => {
  return (
    <div>
      <Nav />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prediction" element={<Prediction />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
