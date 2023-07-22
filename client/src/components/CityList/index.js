import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_ALL_CITIES = gql`
  query {
    getAllCities {
      id
      city
    }
  }
`;

export default function CityList() {
  const { loading, error, data } = useQuery(GET_ALL_CITIES);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка...</p>;

  return (
    <div className='city-list'>
      <h1>Список городов</h1>
      <ul>
        {data.getAllCities.map((city) => (
          <li key={city.id}>
            <Link to={`/city/${city.id}`}>{city.city}</Link>
          </li>
        ))}
      </ul>
    </div >
  );
}
