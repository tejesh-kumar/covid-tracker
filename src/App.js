import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';

import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

import './App.css';

function App() {
	const [ countries, setCountries ] = useState([]);
	const [ country, setCountry ] = useState('worldwide');
	const [ countryInfo, setCountryInfo ] = useState({});
	const [ tableData, setTableData ] = useState([]);
	const [ mapCenter, setMapCenter ] = useState({lat: 34.80746, lng: -40.4796});
	const [ mapZoom, setMapZoom ] = useState(3);
	const [ mapCountries, setMapCountries ] = useState([]);
	const [ casesType, setCasesType ] = useState('cases');
																		
																		
	useEffect(() => {
		const getCountriesData = async () => {
			await fetch('https://disease.sh/v3/covid-19/countries').then((res) => res.json()).then((data) => {
				const countries = data.map((country) => {
					return { name: country.country, value: country.countryInfo.iso2 };
				});

				const sortedData = sortData(data);
				setTableData(sortedData);
				setCountries(countries);
				setMapCountries(data);
			});
		};

		getCountriesData();
	}, []);                                      
	
	// useEffect(function, [country]);

	useEffect(() => {
		fetch('https://disease.sh/v3/covid-19/all').then((res) => res.json()).then((data) => {
			setCountryInfo(data);
		});
	}, []);

	const onCountryChange = async (e) => {
		const countryCode = e.target.value;

		const url =
			countryCode === 'worldwide'
				? 'https://disease.sh/v3/covid-19/all'
				: `https://disease.sh/v3/covid-19/countries/${countryCode}`;

		await fetch(url).then((res) => res.json()).then((countryData) => {
			setCountry(countryCode);
			setCountryInfo(countryData);
			setMapCenter([countryData.countryInfo.lat, countryData.countryInfo.long]);
			setMapZoom(4);
		});
	};

	return (
		<div className="app">
			<div className="app__left">
				<div className="app__header">
					<h1>COVID-19 TRACKER</h1>
					<FormControl className="app__dropdown">
						<Select variant="outlined" value={country} onChange={onCountryChange}>
							<MenuItem value="worldwide">Worldwide</MenuItem>
							{countries.map((country) => (
								<MenuItem key={country.value} value={country.value}>
									{country.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				<div className="app__stats">
					<InfoBox isRed active={casesType === 'cases'} onClick={e => setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
					<InfoBox active={casesType === 'recovered'} onClick={e => setCasesType('recovered')} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
					<InfoBox isRed active={casesType === 'deaths'} onClick={e => setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
				</div>

				<div className="app__map">
					<Map countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom} />
				</div>
			</div>

			<Card className="app__right">
				<CardContent>
					<h3>Live Cases By Country</h3>
					<Table countries={tableData} />

					<h3>Worldwide New {casesType}</h3>
					<LineGraph casesType={casesType} />
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
