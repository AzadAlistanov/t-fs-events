import { Link, useParams } from 'react-router-dom'; // Импортируем хук для получения параметров из URL
import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';

const GET_EVENTS_BY_CITY = gql`
  query getEventsByCity($cityId: Int!) {
    getEventsByCity(cityId: $cityId) {
      id
      event
      date
    }
  }
`;

export default function EventList() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { cityId } = useParams();
  const { loading, error, data } = useQuery(GET_EVENTS_BY_CITY, {
    variables: { cityId: parseInt(cityId) }
  });

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка...</p>;

  const filteredEvents = data.getEventsByCity.filter((event) => {
    if (!startDate || !endDate) return true;
    const eventDate = new Date(event.date);
    return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
  });

  return (
    <div className='event-list'>
      <h1>Список событий в городе</h1>
      <div className='filter'>
        <input type="date" value={startDate} onChange={handleStartDateChange} />
        <input type="date" value={endDate} onChange={handleEndDateChange} />
      </div>

      <ul>
        {filteredEvents.map((event) => (
          <li key={event.id}>
            <Link to={`/event/${event.id}`}>{event.event}</Link>
            <span>{new Date(event.date).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}