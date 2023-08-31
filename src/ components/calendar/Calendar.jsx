import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faAngleLeft, faPlus, faCircle, faClose } from "@fortawesome/free-solid-svg-icons";
import Block from "./Block.jsx"
import '../../assets/styles/calendar.css'

export default function Calendar() {
  
  const today=new Date()
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  //Keeping track of the current displaying blocks
  const [currentDate, setCurrentDate] = useState({
    day: todayDate,
    month: todayMonth,
    year: todayYear,
    isSelected: false,
    isToday: false,
    hasTodo: false,
  })


  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState({
    day: todayDate,
    month: todayMonth,
    year: todayYear
  });


  React.useEffect(() => {
    setCalendarDays(prevCalendarDays => {
      return prevCalendarDays.map(row => {
        return row.map(block => {
          let isSelected =
            selectedDay.day === block.props.text &&
            selectedDay.month === block.props.currentDate.month &&
            selectedDay.year === block.props.currentDate.year;
            
          return React.cloneElement(block, {
            ...block.props,
            currentDate: { ...block.props.currentDate, isSelected: isSelected }
          });
        });
      });
    });
  }, [selectedDay]);

  /*-------------------- HELPER FUNCTIONS --------------------*/

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getMonthName(month) {
    const options = { month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(todayYear, month));
  }

  function hasTodo(day, month, year) {
    const formattedDate = formatDate(day, month, year);
    if (formattedDate in todoList && todoList[formattedDate].length > 0) {
      return true;
    }
    return false;
  }

  function formatDate(day, month, year) {
    const date = new Date(year, month, day);
    const formattedDate = date.toISOString().split('T')[0];
    return formattedDate
  }


  /*-------------------- CALENDAR UI --------------------*/

  function renderCalendar() {
    const year = todayYear;
    const daysInMonth = getDaysInMonth(year, currentDate.month);
    const firstDay = new Date(year, currentDate.month, 1).getDay();
  
    const prevMonthDays = getDaysInMonth(year, currentDate.month - 1);
    let calendar = [];
  
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          const prevMonthDaysText = prevMonthDays - firstDay + j + 1;
         
          row.push(
            <Block
              key={prevMonthDaysText}
              text={prevMonthDaysText}
              type="prevMonthDate"
              currentDate={{ ...currentDate, month: currentDate.month - 1 }}
              onClick={() => prevMonthDateClick(prevMonthDaysText, currentDate.month - 1, year)}
            />
          );
        } else if (day > daysInMonth) {
          const nextMonthDaysText = day - daysInMonth;
          row.push(
            <Block
              key={nextMonthDaysText}
              text={nextMonthDaysText}
              type="nextMonthDate"
              currentDate={{ ...currentDate, month: currentDate.month + 1 }}
              onClick={() => nextMonthDateClick(nextMonthDaysText, currentDate.month + 1, year)}
            />
          );
          day++;
        } else {
          const dayText = day;
          const isToday = todayDate === day &&
                          todayMonth === currentDate.month &&
                          todayYear === currentDate.year 
                          ? true : false
          const containTodo = hasTodo(day, currentDate.month, currentDate.year);
          row.push(
            <Block
              key={dayText}
              text={dayText}
              type="date"
              currentDate={{...currentDate, isToday: isToday, hasTodo: containTodo}}
              onClick={() => thisMonthDateClick(dayText, currentDate.month, year)}
            />
          );
          day++;
        }
      }
      calendar.push(row);
    }
    return calendar;
  }
  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return "th";
    } else {
      const lastDigit = day % 10;
      switch (lastDigit) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }
  }

  function toggleNextMonth() {
    setCurrentDate(prevCurrentDate => {
      const nextMonth = prevCurrentDate.month === 11 ? 0 : prevCurrentDate.month + 1;
      const nextYear = prevCurrentDate.month === 11 ? prevCurrentDate.year + 1 : prevCurrentDate.year;
      return { ...prevCurrentDate, month: nextMonth, year: nextYear };
    });
  }

  function togglePrevMonth() {
    setCurrentDate(prevCurrentDate => {
      const prevMonth = prevCurrentDate.month === 0 ? 11 : prevCurrentDate.month - 1;
      const prevYear = prevCurrentDate.month === 0 ? prevCurrentDate.year - 1 : prevCurrentDate.year;
      return { ...prevCurrentDate, month: prevMonth, year: prevYear };
    });
  }
  /*-------------------- CALENDAR FUNCTIONS --------------------*/

  function handleDaySelection(day, month, year) {
    //Select active day
    setSelectedDay({
      day: day,
      month: month,
      year: year
    });
  }
  function prevMonthDateClick(day, month, year) {
    handleDaySelection(day, month, year);
    console.log(`Clicked on block: ${day}/${month}/${year}`);
  }

  function thisMonthDateClick(day, month, year) {
    handleDaySelection(day, month, year);
    console.log(`Clicked on block: ${day}/${month}/${year}`);
  }

  function nextMonthDateClick(day, month, year) {
    handleDaySelection(day, month, year);
    console.log(`Clicked on block: ${day}/${month}/${year}`);
  }

  function selectToday() {
    handleDaySelection(todayDate, todayMonth, todayYear);
    setCurrentDate(prevCurrentDate => ({
      ...prevCurrentDate,
      day: todayDate,
      month: todayMonth,
      year: todayYear,
    }));
  }

  
  const dayOfWeek = new Date(selectedDay.year, selectedDay.month, selectedDay.day).toLocaleString('en-US', { weekday: 'short' });
  const dayMonthYear = `${selectedDay.day}${getDaySuffix(selectedDay.day)} ${getMonthName(selectedDay.month)} ${selectedDay.year}`
  
  /*-------------------- Todos --------------------*/

  const [isAddEvent, setIsAddEvent] = React.useState(false)
  const [todoForm, setTodoForm] = React.useState({
    title: "",
    time: "",
  })

  const [todoList, setTodoList] = React.useState({
    "2023-08-16": [
      {
        title: "Go to gym",
        time: "10:00AM",
        id: crypto.randomUUID()
      },
      {
        title: "Study",
        time: "3PM",
        id: crypto.randomUUID()
      }
    ],
    "2023-07-09": [
      {
        title: "Go to gym",
        time: "8AM",
        id: crypto.randomUUID()
      }, 
      {
        title: "Say hello to neighbor",
        time: "10PM",
        id: crypto.randomUUID()
      }
    ]
  });

  function todoFormOnChange(event) {
    const {name, value} = event.target;
    setTodoForm( prevTodoForm => ({
      ...prevTodoForm,
      [name]:value
    })
    )
  }
  
  function toggleAddEvent() {
    setIsAddEvent(prevIsAddEvent => !prevIsAddEvent)
  }
  
  function addEvent(event) {
    event.preventDefault();
    
    const formattedDate = formatDate(selectedDay.day, selectedDay.month, selectedDay.year)
    const newTodo = {
        title: todoForm.title,
        time: todoForm.time,
        id: crypto.randomUUID()
    }
    const todos = formattedDate in todoList
  ? todoList[formatDate(selectedDay.day, selectedDay.month, selectedDay.year)]
  : false;
    if (todos) {
      todos.push(newTodo);
      setTodoList(prevTodoList => ({
        ...prevTodoList,
        [formattedDate] : todos
      }))
    } else {
      setTodoList(prevTodoList => ({
        ...prevTodoList,
        [formattedDate]: [
          newTodo
        ]
      }))
    }
    setTodoForm({
      title: "",
      time: "",
    })
    // toggleAddEvent();
  }

  function deleteEvent(id) {
    setTodoList((prevTodoList) => {
      const updatedTodoList = {};
  
      Object.keys(prevTodoList).forEach(date => {
        updatedTodoList[date] = prevTodoList[date].filter(event => event.id !== id);
      });
  
      return updatedTodoList;
    });
  }

  const displayTodos =(formatDate(selectedDay.day, selectedDay.month, selectedDay.year)) in todoList
  ? todoList[formatDate(selectedDay.day, selectedDay.month, selectedDay.year)]
  : false;
  /*-----------------------------------------------------------*/
  React.useEffect(() => {
    setCalendarDays(renderCalendar());
  }, [currentDate, todoList])
  return (
    <section className="calendar--wrapper">
      <div className="calendar--container">
        <div className="left">
          <div className="calendar">
            <div className="month">
              <FontAwesomeIcon icon={faAngleLeft} style={{ cursor: 'pointer' }} onClick={togglePrevMonth} />
              <div className="date">
                {getMonthName(currentDate.month)} {currentDate.year}
              </div>
              <FontAwesomeIcon icon={faAngleRight} style={{ cursor: 'pointer' }} onClick={toggleNextMonth} />
            </div>
            <div className="weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="days">{calendarDays}</div>
            <div className="goto-today">
              <div className="goto">
                <input type="text" placeholder="mm/yyyy" className="date-input" />
                <button className="goto-btn">Go</button>
              </div>
              <button className="today-btn" onClick={selectToday}>Today</button>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="today-date">
            <div className="event-day">{dayOfWeek}</div>
            <div className="event-date">{dayMonthYear}</div>
          </div>
          <div className="Todos">
            <div className='events'>
            {displayTodos && displayTodos.map((event) => (
            <div className="event" key={event.id} onClick={()=>deleteEvent(event.id)}>
              <div className="title">
                <i>
                <FontAwesomeIcon icon={faCircle}/>
                </i>
                <h3 className="event-title">{event.title}</h3>
              </div>
              <div className="event-time">
                <span className="event-time">{event.time}</span>
              </div>
            </div>
            ))}
            </div>
          </div>
          <div className={isAddEvent ? "add-event-wrapper active" : "add-event-wrapper"}>
            <div className="add-event-header">
              <div className="title">Add Event</div>
              <i className='close'>
                <FontAwesomeIcon icon={faClose} onClick={toggleAddEvent}/>
              </i>
            </div>
            <div className="add-event-body">
              <form>
              <div className="add-event-input">
                <input 
                type="text" 
                placeholder="Event Name" 
                className="event-name" 
                onChange={todoFormOnChange}
                name="title"
                value={todoForm.title}
                />
              </div>
              <div className="add-event-input">
                <input 
                type="text" 
                placeholder="Event Time From" 
                className="event-time-from"
                onChange={todoFormOnChange} 
                name="time"
                value={todoForm.time}
                />
              </div> 
              <div className="add-event-footer">
              <button className="add-event-btn" onClick={addEvent}>Add Event</button>
              </div> 
              </form>
            </div>
          </div>
        </div>
        <button className="add-event" onClick={toggleAddEvent}>
            <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </section>
  );
  }