import { Link, useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { useEffect, useState } from 'react';

const GET_EVENTS_BY_CITY = gql`
  query getEventsByCity($cityId: Int!, $category: String, $tag: String) {
    getEventsByCity(cityId: $cityId, category: $category, tag: $tag) {
      id
      title
      date
      category
      tag
    }
  }
`;

export default function EventList() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const { cityId } = useParams();
  const { loading, error, data } = useQuery(GET_EVENTS_BY_CITY, {
    variables: { cityId: parseInt(cityId), category, tag },
  });

  useEffect(() => {
    if (data?.getEventsByCity) {
      const allCategories = data.getEventsByCity.map((el) => el.category);
      const uniqueCategories = [...new Set(allCategories)];
      setCategories(uniqueCategories);
    }
  }, [data?.getEventsByCity]);

  useEffect(() => {
    if (data?.getEventsByCity) {
      const allTags = data.getEventsByCity.map((el) => el.tag);
      const uniqueTags = [...new Set(allTags)];
      setTags(uniqueTags);
    }
  }, [data?.getEventsByCity]);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleTagChange = (event) => {
    setTag(event.target.value);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  const filteredEvents = data.getEventsByCity.filter((event) => {
    if (!startDate || !endDate) return true;
    const eventDate = new Date(event.date);
    return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
  }).filter((event) => {
    if (!category) return true;
    return event.category === category;
  }).filter((event) => {
    if (!tag) return true;
    return event.tag === tag;
  });

  return (
    <div className='event-list'>
      <h1>Список событий в городе</h1>
      <div className='filter'>
        <input className='filter-item' type="date" value={startDate} onChange={handleStartDateChange} />
        <input className='filter-item' type="date" value={endDate} onChange={handleEndDateChange} />

        <select className='filter-item' value={category} onChange={handleCategoryChange}>
          <option value=''>Выберите категорию</option>
          {categories.map((categoryOption, i) => (
            <option key={i} value={categoryOption}>
              {categoryOption}
            </option>
          ))}
        </select>

        <select className='filter-item' value={tag} onChange={handleTagChange}>
          <option value=''>Выберите тег</option>
          {tags.map((tagOption, i) => (
            <option key={i} value={tagOption}>
              {tagOption}
            </option>
          ))}
        </select>
      </div>

      <ul>
        {filteredEvents.map((event) => (
          <li key={event.id}>
            <Link to={`/event/${event.id}`}>{event.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
