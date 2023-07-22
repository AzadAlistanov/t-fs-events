import { Routes, Route } from 'react-router-dom';
import CityList from "./components/CityList";
import Venue from "./components/Venue";
import EventList from "./components/EventList";
import NavBar from './components/NavBar';

function App() {
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route exact path="/" element={<CityList />} />


        <Route exact path="/city/:cityId" element={<EventList />} />
        <Route exact path="/event/:eventId" element={<Venue />} />
      </Routes>

    </div>
  );
}

export default App;
