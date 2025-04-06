import React, { useState, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid, Form, Table, Header, Segment, List, Progress } from 'semantic-ui-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';


const Home = () => {

    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitForStock = (e) => {
        setIsLoading(true)
        console.log(`Form submitted: ${prompt}`);
        e.preventDefault();
        fetch('http://127.0.0.1:5000/stock-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 'symbol': prompt })
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((data) => {
            console.log('Data from backend:', data);
            setResponse(data);
        }).catch((error) => {
            console.error('Error fetching data:', error);
            setResponse('Error fetching data:' + error)
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <Grid padded>
            <Grid.Row>
                <Grid.Column width={16}>
                    <Form onSubmit={handleSubmitForStock}>
                        <Form.Input
                            fluid
                            placeholder="Enter stock symbol (e.g., NVDA)"
                            onChange={(e) => setPrompt(e.target.value)}
                            value={prompt}
                            action={{ content: 'Analyze Stock', loading: isLoading }}
                        />
                    </Form>
                </Grid.Column>
            </Grid.Row>
            {response && (
                <>
                    {/* Company Overview */}
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Segment>
                                <Header as='h2'>{response.stock_analysis.company_info.name}</Header>
                                <Table basic='very'>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell><strong>Current Price:</strong></Table.Cell>
                                            <Table.Cell>${response.stock_analysis.current_price}</Table.Cell>
                                            <Table.Cell><strong>Sector:</strong></Table.Cell>
                                            <Table.Cell>{response.stock_analysis.company_info.sector}</Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell><strong>Industry:</strong></Table.Cell>
                                            <Table.Cell>{response.stock_analysis.company_info.industry}</Table.Cell>
                                            <Table.Cell><strong>Country:</strong></Table.Cell>
                                            <Table.Cell>{response.stock_analysis.company_info.country}</Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                                <p>{response.stock_analysis.company_info.business_summary}</p>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>

                    {/* Stock Price Chart */}
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Segment>
                                <Header as='h3'>Historical Stock Prices</Header>
                                <LineChart width={800} height={300} data={response.stock_analysis.historical_prices.reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="datevalue" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                                </LineChart>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>

                    {/* Financial Ratios */}
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Segment>
                                <Header as='h3'>Financial Ratios</Header>
                                <Table basic='very'>
                                    <Table.Body>
                                        {Object.entries(response.stock_analysis.financial_ratios).map(([key, value]) => (
                                            <Table.Row key={key}>
                                                <Table.Cell><strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong></Table.Cell>
                                                <Table.Cell>{value}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </Segment>
                        </Grid.Column>

                        {/* Analyst Recommendations */}
                        <Grid.Column width={8}>
                            <Segment>
                                <Header as='h3'>Recent Analyst Recommendations</Header>
                                <List divided relaxed>
                                    {response.stock_analysis.analyst_recommendations.map((rec, index) => (
                                        <List.Item key={index}>
                                            <List.Content>
                                                <List.Header>{rec.datevalue}</List.Header>
                                                <List.Description>
                                                    {rec.recommendation} - Target: ${rec.target_price}
                                                    {rec.firm && ` (${rec.firm})`}
                                                </List.Description>
                                            </List.Content>
                                        </List.Item>
                                    ))}
                                </List>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>

                    {/* Income Statements */}
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Segment>
                                <Header as='h3'>Income Statements</Header>
                                <BarChart width={800} height={400} data={response.stock_analysis.income_statements.reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total_revenue" fill="#8884d8" name="Total Revenue" />
                                    <Bar dataKey="net_income" fill="#82ca9d" name="Net Income" />
                                </BarChart>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                </>
            )}
        </Grid>
    );

    // return (
    //     <Grid.Column>
    //         <form onSubmit={handleSubmitForStock}>
    //             <input onChange={(e) => setPrompt(e.target.value)} value={prompt}></input>
    //             <button type='submit'>Click to submit</button>
    //         </form>
    //         {isLoading == true && (<process value={null} />)}
    //         {response && (
    //             <div>
    //                 <h2>Response:</h2>
    //                 <p>{response}</p>
    //             </div>


    //         )
    //         }
    //     </Grid.Column>
    // );

}

export default Home;