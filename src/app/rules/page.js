import Link from 'next/link';
import { Back } from '@/components/icons';

export const metadata = { title: 'Community rules · McPosted' };

export default function RulesPage() {
  return (
    <>
      <header className="subbar">
        <Link href="/" className="icon-btn" aria-label="Back">
          <Back />
        </Link>
        <h1>Community rules</h1>
      </header>
      <main className="page tight" style={{ gap: 20 }}>
        <section className="card">
          <h2 className="section">Post</h2>
          <ul className="rule-list">
            <li><b>No names, ever.</b> No full names, initials, nicknames, or handles. That includes teachers and staff.</li>
            <li>No posts that point at one specific person, even without a name.</li>
            <li>No threats, bullying, slurs, or sexual content.</li>
            <li>No one's private info: grades, address, phone, family, health.</li>
            <li>No profanity.</li>
            <li>Text only. No photos, videos, or screenshots of other people's messages.</li>
          </ul>
        </section>
        <section className="card">
          <h2 className="section">How moderation works</h2>
          <ul className="rule-list">
            <li>Every post and reply gets an automatic check before it goes up.</li>
            <li>Posts that might break the rules wait for a student moderator.</li>
            <li>Three reports hide a post until a moderator reviews it.</li>
            <li>Three removed posts lock an account until an admin reviews it.</li>
          </ul>
        </section>
        <section className="card">
          <h2 className="section">Anonymous, with one exception</h2>
          <p className="small" style={{ margin: 0 }}>
            Other students and moderators never see who wrote a post. If a post is a credible threat to someone's
            safety, the McPosted admin can look up who wrote it and will report it to the school.
          </p>
        </section>
        <section className="card">
          <h2 className="section">Need to talk to someone?</h2>
          <p className="small" style={{ margin: 0 }}>
            The Counseling Center has an open-door policy. You can also call or text 988 any time.
          </p>
        </section>
      </main>
    </>
  );
}
