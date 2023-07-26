import { useParams } from 'react-router-dom'; // Импортируем хук для получения параметров из URL
import { useQuery, gql } from '@apollo/client';

const GET_VENUE_BY_ID = gql`
  query getVenueByEvent($eventId: Int!) {
    getVenueByEvent(eventId: $eventId) {
      id
      venue
      description
      url
      age
      min_price
      max_price
      date
    }
  }
`;

export default function Venue() {
  const { eventId } = useParams();
  const { loading, error, data } = useQuery(GET_VENUE_BY_ID, {
    variables: { eventId: parseInt(eventId) }
  });

  const isData = data?.getVenueByEvent[0] !== undefined

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка...</p>;

  const { venue, description, url, age, min_price, max_price } = data?.getVenueByEvent[0];
  const date = data?.getVenueByEvent[0].date;

  if (isData)
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
          <p>Описание: <br />
            <span className='description'>{description ? description : 'Описание отсутствует..'}</span>
          </p>
          <a href={url}>
            <p>Ссылка мероприятие<br />
            </p>
          </a>
          <div className='venue-bottom'>
            <p>Ограничения по возрасту: <br />
              <span>{age} +</span>
            </p>
            <p>Цена билета: <br />
              <span>{min_price}₽</span>
              -
              <span>{max_price}₽</span>
            </p>
          </div>
        </div>
      </>
    );
};