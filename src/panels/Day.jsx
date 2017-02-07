import React, {Component} from 'react';
import moment from 'moment';
import classNames from 'classnames/bind';

import {WEEKS, DAY_FORMAT} from '../contants';
import {range, chunk} from '../utils';


class Day extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moment: props.moment ? props.moment.clone() : moment(),
      selected: props.moment ? props.moment.clone() : null
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      moment: props.moment ? props.moment.clone() : moment(),
      selected: props.moment ? props.moment.clone() : null
    });
  }

  changeMonth = (dir) => {
    this.setState({
      moment: this.state.moment[dir === 'prev' ? 'subtract' : 'add'](1, 'month')
    });
  }

  select = (day, isSelected, isDisabled, isPrevMonth, isNextMonth) => {
    if (isSelected || isDisabled) return;

    const _moment = this.state.moment.clone();

    if (isPrevMonth) _moment.subtract(1, 'month');
    if (isNextMonth) _moment.add(1, 'month');

    _moment.date(day);

    this.setState({
      moment: _moment,
      selected: _moment
    });
    this.props.onSelect(_moment);
  }

  _renderWeek = (week) => {
    return (
      <th key={week}>{week}</th>
    );
  }

  _renderDay = (day, week) => {
    const now = moment();
    const _moment = this.state.moment;
    const {maxDate, minDate} = this.props;
    const {selected} = this.state;
    const isPrevMonth = week === 0 && day > 7;
    const isNextMonth = week >= 4 && day <= 14;
    const month = isNextMonth 
                  ? _moment.clone().add(1, 'month') 
                  : isPrevMonth 
                    ? _moment.clone().subtract(1, 'month')
                    : _moment.clone();
    const isSelected = selected ? month.isSame(selected.clone().date(day), 'day') : false;
    const disabledMax = maxDate ? month.date(day).isAfter(maxDate, 'day') : false;
    const disabledMin = minDate ? month.date(day).isBefore(minDate, 'day') : false;
    const isDisabled = disabledMax || disabledMin;
    const className = classNames({
      prev: isPrevMonth,
      next: isNextMonth,
      selected: isSelected,
      now: now.isSame(month.date(day), 'day'),
      disabled: isDisabled
    });

    return (
      <td key={day} className={className} onClick={() => this.select(day, isSelected, isDisabled, isPrevMonth, isNextMonth)}>{day}</td>
    );
  }

  render() {
    const _moment = this.state.moment;
    const firstDay = _moment.clone().date(1).day();
    const endOfThisMonth = _moment.clone().endOf('month').date();
    const endOfLastMonth = _moment.clone().subtract(1, 'month').endOf('month').date();
    let days = [].concat(
      range(endOfLastMonth - firstDay + 1, endOfLastMonth + 1),
      range(1, endOfThisMonth + 1),
      range(1, 42 - endOfThisMonth - firstDay + 1)
    );
    const {weeks = WEEKS, dayFormat = DAY_FORMAT} = this.props;
    
    let useWeeks = weeks.slice()
    if(this.props.weekStartWithMonday) {
        days = days.map(i => { return i+1 })
        //array of weeks allways starts with Sunday, so put Sunday at the end of the Week
        let el = useWeeks.shift()
        useWeeks.push(el)
    }

    return (
      <div className="calendar-days" style={this.props.style}>
        <div className="calendar-nav">
          <button type="button" className="prev-month" onClick={() => this.changeMonth('prev')}>
            <i className="fa fa-angle-left"/>
          </button>
          <span className="current-date" onClick={() => this.props.changePanel('month', _moment)}>{_moment.format(dayFormat)}</span>
          <button type="button" className="next-month" onClick={() => this.changeMonth('next')}>
            <i className="fa fa-angle-right"/>
          </button>
        </div>
        <table>
          <thead>
            <tr>{useWeeks.map((week) => this._renderWeek(week))}</tr>
          </thead>
          <tbody>
            {chunk(days, 7).map((week, idx) => {
              return (
                <tr key={idx}>
                  {week.map((day) => {
                    return this._renderDay(day, idx);
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}


export default Day;