
import ReactDOM from 'react-dom/client';
import './index.css';
import { Component } from 'react';
import ParliamentChart from './parliamentChart';
import reportWebVitals from './reportWebVitals';
import * as d3 from 'd3';

let metric = 'age';

let deputeesUrl = require('./data/deputes-active.csv');

const root = ReactDOM.createRoot(document.getElementById('root'));

let parliament = ParliamentChart().width(800).height(400).metric(metric);

class MetricForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: metric};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    metric = event.target.value;
  }

  render() {
    return (
      <form>
        <label>
          Metric : 
          <select value={this.state.value} onChange={this.handleChange}>
          <option value="id">id</option>
          <option value="legislature">legislature</option>
          <option value="civ">civ</option>
          <option value="nom">nom</option>
          <option value="prenom">prenom</option>
          <option value="naissance">naissance</option>
          <option value="age">age</option>
          <option value="groupe">groupe</option>
          <option value="groupeAbrev">groupeAbrev</option>
          <option value="departementNom">departementNom</option>
          <option value="departementCode">departementCode</option>
          <option value="circo">circo</option>
          <option value="datePriseFonction">datePriseFonction</option>
          <option value="job">job</option>
          <option value="mail">mail</option>
          <option value="twitter">twitter</option>
          <option value="facebook">facebook</option>
          <option value="website">website</option>
          <option value="nombreMandats">nombreMandats</option>
          <option value="experienceDepute">experienceDepute</option>
          <option value="scoreParticipation">scoreParticipation</option>
          <option value="scoreParticipationSpecialite">scoreParticipationSpecialite</option>
          <option value="scoreLoyaute">scoreLoyaute</option>
          <option value="scoreMajorite">scoreMajorite</option>
          <option value="dateMaj">dateMaj</option>
          </select>
        </label>
      </form>
    );
  }
}

d3.csv(deputeesUrl)
  .then((data) => {
    
    let parlDiv = d3.select(document.getElementById('parliament'));
    parlDiv.datum(data).call(parliament);
  });

root.render(
  <div>
    <br/>
    <MetricForm></MetricForm>
    <br/>
    <br/>
    <br/>
    <br/>
    <div id="parliament"></div>
  </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
