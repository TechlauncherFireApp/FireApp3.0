import './Availability.scss';

import axios from 'axios';
import { endOfToday, getDay, getHours, getMinutes, set } from 'date-fns';
import React from 'react';
import DayPicker from 'react-day-picker';
import TimeRange from 'react-timeline-range-slider';

import { contains } from '../../../common/functions';
import { backendPath } from '../../../config';

// States for TimeRange
const now = new Date();
const getTodayAtSpecificHour = (hour = 12, minutes = 0) =>
  set(now, { hours: hour, minutes: minutes, seconds: 0, milliseconds: 0 });
const getSelectedAtSpecificHour = (date, hour = 12, minutes = 0) =>
  set(date, { hours: hour, minutes: minutes, seconds: 0, milliseconds: 0 });

const selectedStart = getTodayAtSpecificHour();
const selectedEnd = getTodayAtSpecificHour(12, 30);

const startTime = getTodayAtSpecificHour(0);
const endTime = endOfToday();

const modifierStyles = {
  selected: {
    color: '#000000',
    backgroundColor: '#87CEFA',
  },
  previous: {
    color: '#000000',
    backgroundColor: '#ffb3b3',
  },
};

export default class Availability extends React.Component {
  constructor(props) {
    super(props);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.state = {
      availableHours: 0,
      prefMatchesAvailable: false,
      modifiedDays: [],
      selectedDay: now,
      allow_getPrefHours: true,
      allow_patchPrefHours: true,
      allow_getSchedule: true,
      allow_patchSchedule: true,
      error: false,
      selectedInterval: [selectedStart, selectedEnd],
      previousIntervals: [],
      modifiers: { previous: new Date() },
    };
  }

  componentDidMount() {
    this.getPrefHours();
    this.getSchedule();
    this.checkAvailabilityAndPref();
    this.displaySchedule();
  }

  // Calendar Methods

  handleDayClick(day, { selected }) {
    this.setState(
      {
        selectedDay: selected ? undefined : day,
      },
      () => {
        this.displaySchedule();
      }
    );
  }

  checkAvailabilityAndPref = () => {
    if (this.state.prefHours && contains(this.state.prefHours) &&
        this.state.schedule && contains(this.state.schedule)) {
      const s = this.state.schedule;
      const preferred = this.state.prefHours;
      let totalAvailableHours = 0;
      for (let k = 0; k < 7; k++) {
        let day = this.convertNumToDay(k);
        for (const l of s[day]) {
          let start = l[0];
          let end = l[1];
          totalAvailableHours = totalAvailableHours + (end - start);
        }
      }
      this.setState({availableHours: totalAvailableHours});
      if (preferred <= totalAvailableHours &&
          preferred != null && preferred != 0) {
        this.setState({prefMatchesAvailable: true});
      } else {
        this.setState({prefMatchesAvailable: false});
      }
    }
}

  // TimeRange Methods

  displaySchedule() {
    if (
      this.state.schedule &&
      contains(this.state.schedule) &&
      this.state.selectedDay &&
      contains(this.state.selectedDay)
    ) {
      const selected = this.state.selectedDay;
      const k = this.convertNumToDay(getDay(selected));
      const s = this.state.schedule;
      let prevIntervals = [];
      for (const l of s[k]) {
        const startTime = this.convertNumToTime(l[0]);
        const startInterval = getSelectedAtSpecificHour(
          now,
          startTime[0],
          startTime[1]
        );
        const endTime = this.convertNumToTime(l[1]);
        const endInterval = getSelectedAtSpecificHour(
          now,
          endTime[0],
          endTime[1]
        );
        const interval = { start: startInterval, end: endInterval };
        prevIntervals = prevIntervals.concat(interval);
        this.addModifiedDay(k);
      }
      this.setState({ selectedInterval: [selectedStart, selectedEnd] });
      this.setState({ previousIntervals: prevIntervals }, () => {this.checkAvailabilityAndPref()});
    }
  }

  displayModifiedDays() {
    const modified = this.state.modifiedDays;
    let numberDay = 0;
    let arrDays = [];
    for (let i = 0; i < modified.length; i++) {
      if (JSON.stringify(modified[i]) === JSON.stringify('Sunday')) {
        numberDay = 0;
      }
      if (JSON.stringify(modified[i]) === JSON.stringify('Monday')) {
        numberDay = 1;
      }
      if (JSON.stringify(modified[i]) === JSON.stringify('Tuesday')) {
        numberDay = 2;
      }
      if (JSON.stringify(modified[i]) === JSON.stringify('Wednesday')) {
        numberDay = 3;
      }
      if (JSON.stringify(modified[i]) === JSON.stringify('Thursday')) {
        numberDay = 4;
      }
      if (JSON.stringify(modified[i]) === JSON.stringify('Friday')) {
        numberDay = 5;
      }
      if (JSON.stringify(modified[i]) === JSON.stringify('Saturday')) {
        numberDay = 6;
      }
      arrDays = arrDays.concat(numberDay);
    }
    const mod = {
      previous: { daysOfWeek: arrDays },
    };
    this.setState({ modifiers: mod });
  }

  // Converts float value to the nearest half hour interval (6.5 becomes [6, 30])
  convertNumToTime(n) {
    const hour = Math.floor(n);
    let minutes = n - hour;
    if (minutes > 0.1) {
      minutes = 30;
    }
    return [hour, minutes];
  }

  // Converts number representation of weekday to the day
  convertNumToDay(n) {
    if (n === 0) return 'Sunday';
    if (n === 1) return 'Monday';
    if (n === 2) return 'Tuesday';
    if (n === 3) return 'Wednesday';
    if (n === 4) return 'Thursday';
    if (n === 5) return 'Friday';
    return 'Saturday';
  }

  getModifiedDays = () => {
    if (this.state.schedule && contains(this.state.schedule)) {
      const s = this.state.schedule;
      let modified = [];
      for (const key in s) {
        const val = s[key];
        if (val.length > 0) {
          modified = modified.concat(key);
        }
      }
      this.setState({ modifiedDays: modified }, () => {
        this.displaySchedule();
        this.displayModifiedDays();
      });
    }
  };

  addModifiedDay(day) {
    let modified = this.state.modifiedDays;
    if (modified.includes(day)) {
      return;
    }
    modified = modified.concat(day);
    this.setState({ modifiedDays: modified }, () => {
      this.displaySchedule();
      this.displayModifiedDays();
    });
  }

  removeModifiedDay(day) {
    const modified = this.state.modifiedDays;
    const index = modified.indexOf(day);
    if (index > -1) {
      modified.splice(index, 1);
    }
    this.setState({ modifiedDays: modified }, () => {
      this.displaySchedule();
      this.displayModifiedDays();
    });
  }

  errorHandler = ({ error }) => this.setState({ error });

  onChangeCallback = (selectedInterval) => {
    this.setState({ selectedInterval });
  };

  addAvailability = () => {
    if (
      this.state.schedule &&
      contains(this.state.schedule) &&
      this.state.selectedDay &&
      contains(this.state.selectedDay)
    ) {
      const interval = this.state.selectedInterval;
      const startAvailability = this.convertDateToNum(interval[0]);
      const endAvailability = this.convertDateToNum(interval[1]);
      const availability = [startAvailability, endAvailability];
      const k = this.convertNumToDay(getDay(this.state.selectedDay));
      let s = this.state.schedule;
      // Check new availability does not overlap, if adjacent they combine
      let overlaps = false;
      for (let j = 0; j < s[k].length; j++) {
        const current = s[k][j];
        for (let m = 0; m < s[k].length; m++) {
          const next = s[k][m];
          if (current === next) {
            continue;
          }
          if (startAvailability === current[1] && endAvailability === next[0]) {
            s[k][j][1] = s[k][m][1];
            s[k] = s[k].splice(j, 1);
            this.setState({ schedule: s }, () => {
              this.displaySchedule();
            });
          }
          if (startAvailability === next[1] && endAvailability === current[0]) {
            s[k][j][0] = s[k][m][0];
            s[k] = s[k].splice(j, 1);
            this.setState({ schedule: s }, () => {
              this.displaySchedule();
            });
          }
          if (
            (startAvailability >= next[0] && startAvailability < next[1]) ||
            (endAvailability > next[0] && endAvailability <= next[1]) ||
            (startAvailability <= next[0] && endAvailability >= next[1]) ||
            (startAvailability === current[1] && endAvailability >= next[0]) ||
            (startAvailability === next[1] && endAvailability >= current[0]) ||
            (endAvailability === current[0] && startAvailability <= next[1]) ||
            (endAvailability === next[0] && startAvailability <= current[1]) ||
            (endAvailability === current[1] && startAvailability >= next[0]) ||
            (endAvailability === next[1] && startAvailability >= current[0]) ||
            (startAvailability === current[0] && endAvailability <= next[1]) ||
            (startAvailability === next[0] && endAvailability <= current[1])
          ) {
            return;
          }
        }
        if (
          (startAvailability >= current[0] && startAvailability < current[1]) ||
          (endAvailability > current[0] && endAvailability <= current[1]) ||
          (startAvailability <= current[0] && endAvailability >= current[1])
        ) {
          overlaps = true;
          break;
        }
        if (startAvailability === current[1]) {
          s[k][j][1] = endAvailability;
          this.setState({ schedule: s }, () => {
            this.displaySchedule();
          });
          return;
        }
        if (endAvailability === current[0]) {
          s[k][j][0] = startAvailability;
          this.setState({ schedule: s }, () => {
            this.displaySchedule();
          });
          return;
        }
      }
      if (!overlaps) {
        const i = s[k].length;
        s[k][i] = availability;
        this.setState({ schedule: s }, () => {
          this.displaySchedule();
        });
      }
    }
  };

  deleteAvailability = () => {
    if (
      this.state.schedule &&
      contains(this.state.schedule) &&
      this.state.selectedDay &&
      contains(this.state.selectedDay)
    ) {
      const k = this.convertNumToDay(getDay(this.state.selectedDay));
      const s = this.state.schedule;
      s[k] = [];
      this.setState({ schedule: s }, () => {
        this.displaySchedule();
      });
      this.removeModifiedDay(k);
    }
  };

  convertDateToNum(d) {
    const hour = getHours(d);
    let minutes = getMinutes(d);
    if (minutes > 0) {
      minutes = 0.5;
    }
    return hour + minutes;
  }

  // Backend Requests
  getPrefHours() {
    if (!this.state.allow_getPrefHours) return;
    this.setState({ allow_getPrefHours: false });

    axios
      .request({
        url: backendPath + '/volunteer/prefhours',
        method: 'GET',
        params: { volunteerID: localStorage.getItem('id') },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
        },
      })
      .then((res) => {
        if (typeof res.data === 'object' && res.data['success']) {
          this.setState({ prefHours: res.data['prefHours'] });
        } else alert('Request Failed');
        this.setState({ allow_getPrefHours: true });
      })
      .catch((err) => {
        if (err.response !== undefined && err.response.status === 401) {
          this.props.history.push('/login');
        } else {
          alert(err.message);
          this.setState({ allow_getPrefHours: true });
        }
      });
  }

  getSchedule() {
    if (!this.state.allow_getSchedule) return;
    this.setState({ allow_getSchedule: false });

    axios
      .request({
        url: backendPath + '/volunteer/availability',
        method: 'GET',
        params: { volunteerID: localStorage.getItem('id') },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
        },
      })
      .then((res) => {
        if (typeof res.data === 'object' && res.data['success']) {
          const n = res.data['availability'];
          this.setState({ schedule: n });
          this.getModifiedDays();
        } else alert('Request Failed');
        this.setState({ allow_getSchedule: true });
      })
      .catch((err) => {
        if (err.response !== undefined && err.response.status === 401) {
          this.props.history.push('/login');
        } else {
          alert(err.message);
          this.setState({ allow_getSchedule: true });
        }
      });
  }

  patchPrefHours = () => {
    if (
      !this.state.allow_patchPrefHours ||
      !contains(this.state.allow_patchPrefHours)
    )
      return;
    this.setState({ allow_patchPrefHours: false });

    axios
      .request({
        url: backendPath + '/volunteer/prefhours',
        method: 'PATCH',
        params: {
          volunteerID: localStorage.getItem('id'),
          prefHours: Number(this.state.prefHours),
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
        },
      })
      .then((res) => {
        if (res['success'] === false) alert('Failed to save preferred hours!');
        this.setState({ allow_patchPrefHours: true });
      })
      .catch((err) => {
        if (err.response !== undefined && err.response.status === 401) {
          this.props.history.push('/login');
        } else {
          alert(err.message);
          this.setState({ allow_patchPrefHours: true });
        }
      });
  };

  patchSchedule = () => {
    if (!this.state.allow_patchSchedule || !contains(this.state.schedule))
      return;
    this.setState({ allow_patchSchedule: false });
    axios
      .request({
        url: backendPath + '/volunteer/availability',
        method: 'PATCH',
        params: { volunteerID: localStorage.getItem('id') },
        data: { availability: this.state.schedule },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
        },
      })
      .then((res) => {
        if (res['success'] === false) alert('Failed to save availabilities!');
        this.setState({ allow_patchSchedule: true });
      })
      .catch((err) => {
        if (err.response !== undefined && err.response.status === 401) {
          this.props.history.push('/login');
        } else {
          alert(err.message);
          this.setState({ allow_patchSchedule: true });
        }
      });
  };

  exit = () => {
    window.open(
      `${window.location.origin}/volunteer/${localStorage.getItem('id')}`,
      '_self',
      '',
      false
    );
  };

  handlePrefHoursChange(event) {
    (event.target.value < 0 || event.target.value > 168) ? (event.target.value = 0) : (event.target.value)
    this.setState({prefHours: event.target.value},
        () => {this.patchPrefHours(); this.checkAvailabilityAndPref()});
  }

  render() {
    const { selectedInterval, previousIntervals, error } = this.state;
    const prefMatchesAv = this.state.prefMatchesAvailable;
    const avHours = this.state.availableHours;
    return (
      <availability>
        <div className="exterior">
            <div className="calendar">
              <DayPicker
                  showWeekNumbers
                  selectedDays={this.state.selectedDay}
                  onDayClick={this.handleDayClick}
                  fromMonth={new Date()}
                  todayButton="Return to current month"
                  modifiers={this.state.modifiers}
                  modifiersStyles={modifierStyles}
              />
                <span className="help"
                role="img"
                aria-label="question"
                data-help=
                    {"Begin by selecting your available day, then use the slider to select your available times. " +
                    "Select your preferred working hours and click 'Add Availability'. Add more availabilities or " +
                    "delete them as best fits."}>
                  &#x2370;
                </span>
              </div>
          <div className="time-range">
            <TimeRange
                error={error}
                selectedInterval={selectedInterval}
                timelineInterval={[startTime, endTime]}
                onUpdateCallback={this.errorHandler}
                onChangeCallback={this.onChangeCallback}
                disabledIntervals={previousIntervals}
            />
          </div>
          <div className="hours">
            <p className="sen">Preferred number of hours per week:</p>
            <input
              type="number"
              min="0"
              step="1"
              max="168"
              placeholder="Select"
              title="Set PrefHours"
              value={this.state.prefHours}
              onChange={(e) => this.handlePrefHoursChange(e)}
            />
            <div className="popup" onClick="displayPopup" role="img">
              {prefMatchesAv ?
                <span
                    role="img"
                    aria-label="tick">
                  &#9989;</span> :
                <span
                    className="red-cross"
                    role="img"
                    aria-label="cross"
                    data-tooltip=
                        {"Preferred hours have not been indicated or exceed the " +
                        "currently selected availability of " + avHours +" hours per week."}>
                  &#10060;</span>}</div>
          </div>
          <div className="con">
            <button
              className="type-3"
              onClick={() => {
                this.addAvailability();
                this.patchPrefHours();
                this.patchSchedule();
              }}>
              Add Availability
            </button>
            <button
              className="type-3"
              onClick={() => {
                this.deleteAvailability();
                this.patchPrefHours();
                this.patchSchedule();
              }}>
              Delete Availabilities For This Day
            </button>
            <div className="con-2">
              <button className="type-2" onClick={this.exit}>
                Return
              </button>
            </div>
          </div>
        </div>
      </availability>
    );
  }
}
