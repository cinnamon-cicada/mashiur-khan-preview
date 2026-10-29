import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <nav className="route-toggle" aria-label="Edition">
        <NavLink to="/" end>Studio</NavLink>
        <NavLink to="/sf">SF</NavLink>
      </nav>
    </header>
  )
}
