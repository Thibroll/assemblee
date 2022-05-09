
import ReactDOM from 'react-dom/client';
import './index.css';
import ParliamentChart from './parliamentChart';
import reportWebVitals from './reportWebVitals';
import * as d3 from 'd3';

let deputeesUrl = require('./data/deputes-active.csv');
const root = ReactDOM.createRoot(document.getElementById('root'));
d3.csv(deputeesUrl)
  .then((data) => {
    let parliament = ParliamentChart();
    let svg = d3.select(document.getElementById('parliament'));
    svg.datum(data).call(parliament);
  });

root.render(
  <svg id="parliament" width='800' height='400'></svg>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
