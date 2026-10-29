import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="monogram" aria-label="Mashiur Khan, home">MK</Link>
      <nav className="route-toggle" aria-label="Edition">
        <NavLink to="/" end>Studio</NavLink>
        <NavLink to="/sf">SF</NavLink>
      </nav>
    </header>
  )
}
