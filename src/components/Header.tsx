import { NavLink, useLocation } from 'react-router-dom'

export default function Header() {
  const onSf = useLocation().pathname.startsWith('/sf')
  return (
    <header className="site-header">
      <nav className={`route-toggle${onSf ? ' on-sf' : ''}`} aria-label="Edition">
        <span className="route-thumb" aria-hidden="true" />
        <NavLink to="/" end>Studio</NavLink>
        <NavLink to="/sf">SF</NavLink>
      </nav>
    </header>
  )
}
