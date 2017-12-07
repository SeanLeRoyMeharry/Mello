import moment from 'moment';
import './Calendar.css';
import React, { Component } from 'react';

const today = moment();

export class Calendar extends Component{
    constructor(props){
        super(props);
        this.state ={
            events:this.props.events,
            current: moment().clone()
        }        
    }

    rightHandler(){
        // var update = this.state.title;
        this.setState({current: this.state.current.add(1, "months")})
    }
    leftHandler(){
        var update = today;
        this.setState({current: this.state.current.subtract(1, "months")})
    }

    render(){
        return(
            <div id="calendar">
            <Headers current={this.state.current} rightHandler={()=>this.rightHandler()} leftHandler={()=>this.leftHandler()}/>
            <Month  current={this.state.current}/>
            </div>
        );
    }
}

class Headers extends Component{
    constructor(props){
        super(props);
        this.state={
            current: this.props.current
        }
    }
    

    render(){
        return(
            <div className="header">
                <h1>{this.state.current.format('MMMM YYYY')}</h1>
                <div className="right" onClick={this.props.rightHandler}></div>
                <div className="left" onClick={this.props.leftHandler}></div>
            </div>
        );
    }
}

class Month extends Component{
    constructor(props){
        super(props);
    }

    current(){
        var clone = this.props.current.date(1).clone();
        var weekInMonth = [];
        var key = 0;
        while(clone.month() === this.props.current.date(1).month()) {           // content.push(<Day key={key} day={clone.format} />);
            // content.push(clone.add('days', 1).format());
            weekInMonth.push(<Day key={clone.format()} day={moment(clone)} current={this.props.current} />)
            clone.add('days', 1);
            // console.log(clone);
        }
        return weekInMonth;
    }

    backfill(){
        var backfill = []
        var clone = this.props.current.date(1).clone();
        console.log(clone);
        var dayOfWeek = clone.day();
        if(!dayOfWeek) { return; }
        clone.subtract(dayOfWeek+1,'days').format;
        console.log(dayOfWeek);
        for(var i = dayOfWeek; i > 0 ; i--) {
            var theDay = clone.add(1, 'days').format(); 
            backfill.push(<Day key={theDay} day={moment(theDay)} current={this.props.current} />)            
        } 
        return backfill;      
    }

    forwardfill(){
        var forwardfill = []
        var clone = this.props.current.date(1).clone().add('months', 1).subtract('days', 1);
        var dayOfWeek = clone.day();
        if(dayOfWeek === 6) { return; }
        for(var i = dayOfWeek; i < 6 ; i++) {
            var theDay = clone.add(1, 'days').format();         
            forwardfill.push(<Day key={theDay} day={moment(theDay)} current={this.props.current} />)            
        }
        return forwardfill;
    }

    combine(){
        let weekInMonth = this.current();
        let backfill = this.backfill();
        let forwardfill = this.forwardfill();
        if(backfill === undefined){
            var all = weekInMonth.concat(forwardfill);
        }else if(forwardfill === undefined){
            all = backfill.concat(weekInMonth);
        }else{
            all = backfill.concat(weekInMonth, forwardfill);
        }
        return all;
    }

    render(){
        let content = this.combine();
        
        return(
            <div>
                {content}
            </div>
        );
    }
}




// class Week extends Component{
//     constructor(props){
//         super(props);
//     }
//     render(){

//         return(
//             <div className="week">
//                 {this.props.days}
//             </div>
//         );
//     }
// }

class Day extends Component{
    constructor(props){
        super(props);
        this.state = {
            week : undefined,
            open : false
        }
    }
    handleClick(){
        this.setState({open : !this.state.open})
    }

    getClassName(day){
        var classes = ['day'];        
        if(day.month() !== this.props.current.month()) {
          classes.push('other');
        } else if (moment().isSame(day, 'day')) {
          classes.push('today');
        }
        return classes.join(' ');
    }

    render(){
        var className = this.getClassName(this.props.day);
        var theDay = this.props.day;   
        var content;
        return(
            
            // outer
            <div className={""+className} onClick={()=>this.handleClick()}>
                <div className="day-name">{theDay.format('ddd')}</div>
                <div className="day-number">{theDay.format('DD')}
                
                {this.state.open  &&
                <div className="day-events">
                {/* <Event day={this.props.day}/> */}
                    <div className="details in">
                    <div className="arrow"></div>
                    </div>
                </div>
                }
                </div>
            </div>
        );
    }
}
