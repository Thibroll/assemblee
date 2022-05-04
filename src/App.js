import './App.css';
import * as d3 from 'd3';
let deputeesUrl = require('./data/deputes-active.csv');


function App() {

  return (
    d3.csv(deputeesUrl, function (data) {
      JSON.stringify(data);
    }).toString()
  );
}

export default App;
