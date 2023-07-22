import { Link } from 'react-router-dom';

export default function NavBar() {

  return (
    <nav className="nav-bar">
      <ul>
        <li>
          <Link to="/">Список городов</Link>
        </li>
      </ul>
    </nav>
  );
}