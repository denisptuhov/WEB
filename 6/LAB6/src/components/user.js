import React from 'react';
import "./user.css"

var pr = 0;

export default class User extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: props.username,
            brokers: props.brokers,
            stocks: props.stocks,
            count: 0,
            index: 0,
            pr: 0
        };
    }

    render() {
        return (
            <div className="User">
                <nav className="one">
                    <ul>
                        <li id="p">{this.props.username}</li>
                        <p></p>
                        <li>Заработок: {pr}</li>
                    </ul>
                </nav>

                <div className="brokers">
                    {this.get_info(this.props.username, this.props.brokers)}
                </div>
                <div className="torgs">
                    {this.get_torgs(this.props.stocks)}
                </div>
                <div className="broker">
                    <p> Продать </p>
                    <table>
                        <tr>
                            <th>id</th>
                            <th>количество</th>
                        </tr>
                        <tr>
                            <th><input id="i" onChange={this.get_index}/></th>
                            <th><input id="i" onChange={this.get_count}/></th>
                        </tr>
                    </table>
                    <button onClick={this.sell}> Продать </button>
                    <p> Купить </p>
                    <table>
                        <tr>
                            <th>id</th>
                            <th>количество</th>
                        </tr>
                        <tr>
                            <th><input onChange={this.get_index}/></th>
                            <th><input onChange={this.get_count}/></th>
                        </tr>
                    </table>
                    <button onClick={this.buy}> Купить </button>
                </div>
            </div>
        );
    }


    get_info(name, br) {
        for (let i = 0; i < br.length; i++) {
            if (br[i].name === name) {
                let broker = [];
                pr = br[i].money - br[i].start_money;
                broker.push(<p> Запас денежных стредств: {br[i].money} </p>);
                let table = [];
                table.push(
                    <tr>
                        <th>id</th>
                        <th>количество</th>
                        <th>стоимость</th>
                        <th>на торгах</th>
                        <th>стоимость</th>
                    </tr>
                );
                for (let j = 0; j < br[i].stocks.length; j++) {
                    table.push(
                        <tr>
                            <td>{j}</td>
                            <td>{br[i].stocks[j]}</td>
                            <td>{br[i].price[j]}</td>
                            <td> {br[i].ontorg_stocks[j]} </td>
                            <td>{br[i].ontorg_price[j]}</td>
                        </tr>
                    )
                }
                broker.push(<table>{table}</table>);
                return <div className="broker">{broker}</div>
            }
        }
    }

    get_torgs(st) {
        let table = [];
        table.push(
            <tr>
                <th>id</th>
                <th>количество</th>
                <th>цена</th>
            </tr>
        );

        for (let i = 0; i < st.length; i++) {
            table.push(
                <tr>
                    <td>{i}</td>
                    <td>{st[i].in_torg}</td>
                    <td>{st[i].price}</td>
                </tr>
            )
        }
        return <div className="broker" id="tt"><p> Акции на торгах</p><table>{table}</table></div>
    }


    sell = (event) => {
        if(this.state.index > this.state.stocks.length)
            return;
        let br = this.state.brokers;
        for (let i = 0; i < br.length; i++) {
            if (br[i].name === this.state.username) {
                if(this.state.count > br[i].stocks[this.state.index]) {
                    return;
                }
            }
        }
        this.props.sell(this.props.username, this.state.index, this.state.count);
    };

    buy = (event) => {
        console.log("зашел");
        let br = this.state.brokers;
        if(this.state.index > this.state.stocks.length) {
            console.log("по индексу");
            return;
        }
        for (let i = 0; i < br.length; i++) {
            if (br[i].name === this.state.username) {
                if(this.state.count > this.state.stocks[this.state.index].in_torg) {
                    console.log("по количеству");
                    console.log(this.state.index);
                    console.log(this.state.stocks[this.state.index].in_torg);
                    return;
                }
                if(br[i].money < this.state.stocks[this.state.index].price * this.state.count) {
                    console.log("деняк нет");
                    return
                }
            }
        }
        console.log("!!!");
        this.props.buy(this.props.username, this.state.index, this.state.count);
    };

    get_index = (event) => {
        this.setState({index: Number(event.target.value)});
    };

    get_count = (event) => {
        this.setState({count: Number(event.target.value)});
    };

}
