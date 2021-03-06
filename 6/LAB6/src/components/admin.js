import React from 'react';
import "./admin.css"


export default class Admin extends React.Component{
    render(){
        return (
            <div className="Admin">
                <nav className="one">
                    <ul>
                        <li id="c"> Admin </li>
                        <p>
                            <li id="b"  onClick={this.props.start_torgs}    > Начать торги </li>
                        </p>
                    </ul>
                </nav>

                <div className="brokers" id="k">
                    {get_brokers(this.props.brokers)}
                </div>
            </div>
        );

        function get_brokers(br){
            let brokers=[];
            for (let i = 0; i < br.length;i++){
                let broker = [];
                broker.push(<p> {br[i].name} </p>);
                broker.push(<p> {br[i].money} </p>);
                let table = [];
                table.push(
                    <tr>
                        <th>количество</th>
                        <th>стоимость</th>
                        <th>на торгах</th>
                        <th>стоимость</th>
                    </tr>
                );
                for (let j = 0; j < br[i].stocks.length; j++){
                    table.push(
                        <tr>
                            <td>{br[i].stocks[j]}</td>
                            <td>{br[i].price[j]}</td>
                            <td>{br[i].ontorg_stocks[j]}</td>
                            <td>{br[i].ontorg_price[j]}</td>
                        </tr>
                    )
                }
                broker.push(<table>{table}</table>)
                brokers.push(<div className = "broker" key = {br[i].id}> {broker}</div>)
                brokers.push(<p></p>)
            }
            return <div>{brokers}</div>
        }
    }

}
