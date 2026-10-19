import Link from 'next/link';
import { Home, Tray, Plus, Person } from '@/components/icons';

export default function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <Link href="/" className={active === 'home' ? 'on' : ''} aria-current={active === 'home' ? 'page' : undefined}>
        <Home />
        <span>Home</span>
      </Link>
      <Link href="/new" className="plus" aria-label="New post">
        <Plus />
      </Link>
      <Link href="/lunch" className={active === 'lunch' ? 'on' : ''} aria-current={active === 'lunch' ? 'page' : undefined}>
        <Tray />
        <span>Lunch</span>
      </Link>
      <Link href="/me" className={active === 'me' ? 'on' : ''} aria-current={active === 'me' ? 'page' : undefined}>
        <Person />
        <span>Me</span>
      </Link>
    </nav>
  );
}
