import React, { useEffect, useState, useRef } from 'react';
import { interval, of, Subject } from "rxjs";
import {
  scan,
  startWith,
  switchMap,
  filter
} from "rxjs/operators";
import moment from 'moment';
import './App.css';

const action$ = new Subject();

const observable$ = action$.pipe(
  switchMap(x => {
    if(x === "pause") {
      return of("pause")
    } else if(x === "stop") {
      return of(0, "pause");
    } else {
      return interval(1000).pipe(
        startWith(x),
        scan(number => number + 1)
      );
    }
  }
)).pipe(filter(x => x !== "pause"));

const formatTime = (seconds) => {
  return moment("00:00:00", "HH:mm:ss").add(seconds, "s").format("HH:mm:ss");
}

function App() {
  const [time, setTime] = useState(0);
  const [isGoing, setIsGoing] = useState(false);
  const dblClick = useRef(null);

  useEffect(() => {
    const subscription = observable$.subscribe(setTime);
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const onStartButtonHandler = () => {
    if(isGoing) {
      action$.next("stop");
    } else {
      action$.next(time);
    }
      setIsGoing(prev => !prev);
  }

  const onResetButtonHandler = () => {
    action$.next(0);
    setIsGoing(true);
  }

  const onWaitButtonHandler = (event) => {
    const target = event.currentTarget;

    const clickListener = () => {
      action$.next("pause");
      setIsGoing(false);
      clearTimeout(dblClick.current);
      target.removeEventListener('click', clickListener);
      dblClick.current = null;
    }

    if(!dblClick.current) {
      target.addEventListener('click', clickListener);
    
      dblClick.current = setTimeout(() => {
        target.removeEventListener('click', clickListener);  
        dblClick.current = null;
      }, 300)
    }
  }

  return (
    <div className="App">
      <h2>StopWatch App</h2>
      <h1>
        {
          formatTime(time)
        }
      </h1>
      <button onClick={onWaitButtonHandler}>
        Wait
      </button>
      <button className="start_button" onClick={onStartButtonHandler}>
        {
          isGoing ? "Stop" : "Start"
        }
      </button>
      <button onClick={onResetButtonHandler}>
        Reset
      </button>
    </div>
  );
}

export default App;
