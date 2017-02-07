/**
 * Created by Administrator on 2016/11/25/025.
 */
import React from 'react';
import { render } from 'react-dom'
import { TimePicker  } from 'antd-mobile';
import "style/index.scss"


class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            seconde:0
        };
    }

    render(){
        return (
            <div>
                <ul>
                    <li>li</li>
                    <li className="adl">111</li>
                    <li>111</li>
                    <li>111</li>
                </ul>
            </div>
        );
    }
}

render(<App/>,document.getElementById("app"));