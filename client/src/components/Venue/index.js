import { useParams } from 'react-router-dom'; // Импортируем хук для получения параметров из URL
import { useQuery, gql } from '@apollo/client';

const GET_VENUE_BY_ID = gql`
  query getVenueByEvent($eventId: Int!) {
    getVenueByEvent(eventId: $eventId) {
      id
      venue
      date
    }
  }
`;

export default function Venue() {
  const { eventId } = useParams();
  const { loading, error, data } = useQuery(GET_VENUE_BY_ID, {
    variables: { eventId: parseInt(eventId) }
  });
  const venue = data?.getVenueByEvent[0].venue;
  const date = data?.getVenueByEvent[0].date;

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка...</p>;

  return (
    <>
      <h1>Информация о событии</h1>
      <div className='venue'>
        <p>Место проведения: <br />
          <span>{venue}</span>
        </p>
        <p>Дата события: <br />
          <span>{new Date(date).toLocaleString()}</span>
        </p>
      </div>
    </>
  );
};