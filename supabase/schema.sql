-- McPosted database setup
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run.
-- It is safe to run once on a brand-new project.

-- ---------------------------------------------------------------------------
-- School rules
-- ---------------------------------------------------------------------------

-- The graduating class for the current school year (switches over in July).
create or replace function public.current_senior_year() returns int
language sql stable as $$
  select case
    when extract(month from (now() at time zone 'America/New_York')) >= 7
      then extract(year from (now() at time zone 'America/New_York'))::int + 1
    else extract(year from (now() at time zone 'America/New_York'))::int
  end
$$;

-- Reads the two-digit graduation year right before the @ (jsmith27@mccallie.org -> 2027).
create or replace function public.grad_year_from_email(addr text) returns int
language plpgsql immutable as $$
declare m text[];
begin
  m := regexp_match(lower(trim(addr)), '([0-9]{2})@mccallie\.org$');
  if m is null then return null; end if;
  return 2000 + m[1]::int;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  grad_year int not null,
  lunch_period text check (lunch_period in ('1st', '2nd')),
  role text not null default 'student' check (role in ('student', 'mod', 'admin')),
  strikes int not null default 0,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null check (channel in ('gossip', 'confessions', 'mysteries', 'events', 'polls')),
  body text not null check (char_length(body) between 1 and 280),
  -- live: visible | held: AI unsure | hidden: reported | urgent: possible threat or self-harm
  -- escalated: sent to the admin | removed: taken down by a moderator
  status text not null default 'live'
    check (status in ('live', 'held', 'hidden', 'urgent', 'escalated', 'removed')),
  flag_reason text,
  created_at timestamptz not null default now()
);
create index posts_created_idx on public.posts (created_at desc);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  position int not null default 0
);

create table public.poll_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  status text not null default 'live'
    check (status in ('live', 'held', 'hidden', 'urgent', 'escalated', 'removed')),
  flag_reason text,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);

create table public.votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (post_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('names', 'bullying', 'threat', 'spam', 'other')),
  created_at timestamptz not null default now(),
  check ((post_id is null) <> (comment_id is null)),
  unique (post_id, user_id),
  unique (comment_id, user_id)
);

create table public.lunch_ratings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  lunch text not null check (lunch in ('1st', '2nd')),
  score int not null check (score between 1 and 10),
  primary key (user_id, day)
);

create table public.settings (
  key text primary key,
  value text
);
insert into public.settings (key, value) values ('teps_date', null);

-- ---------------------------------------------------------------------------
-- New accounts: only current high school students with a school email
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare gy int; senior int;
begin
  gy := public.grad_year_from_email(new.email);
  senior := public.current_senior_year();
  if gy is null or gy < senior or gy > senior + 3 then
    raise exception 'McPosted is only open to current high school students with a school email.';
  end if;
  insert into public.profiles (id, email, grad_year) values (new.id, lower(new.email), gy);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Reports: 3 reports hide a post; a threat report holds it right away
-- ---------------------------------------------------------------------------

create or replace function public.handle_report() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if new.post_id is not null then
    select count(*) into n from reports where post_id = new.post_id;
    if new.reason = 'threat' then
      update posts set status = 'urgent', flag_reason = 'Reported as a threat'
        where id = new.post_id and status in ('live', 'hidden', 'held');
    elsif n >= 3 then
      update posts set status = 'hidden', flag_reason = 'Reported ' || n || ' times'
        where id = new.post_id and status = 'live';
    end if;
  else
    select count(*) into n from reports where comment_id = new.comment_id;
    if new.reason = 'threat' then
      update comments set status = 'urgent', flag_reason = 'Reported as a threat'
        where id = new.comment_id and status in ('live', 'hidden', 'held');
    elsif n >= 3 then
      update comments set status = 'hidden', flag_reason = 'Reported ' || n || ' times'
        where id = new.comment_id and status = 'live';
    end if;
  end if;
  return new;
end $$;

create trigger on_report_created
  after insert on public.reports
  for each row execute function public.handle_report();

-- ---------------------------------------------------------------------------
-- Row level security
-- Posts and comments are never read directly, only through the views below,
-- which leave out who wrote them. New posts and comments are written by the
-- server after the AI check, never straight from a browser.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;
alter table public.reports enable row level security;
alter table public.lunch_ratings enable row level security;
alter table public.settings enable row level security;

create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Students can only change their lunch period, nothing else on their profile.
revoke update on public.profiles from authenticated;
grant update (lunch_period) on public.profiles to authenticated;

create policy "read own votes" on public.votes
  for select to authenticated using (user_id = auth.uid());
create policy "add own votes" on public.votes
  for insert to authenticated with check (user_id = auth.uid());
create policy "change own votes" on public.votes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "remove own votes" on public.votes
  for delete to authenticated using (user_id = auth.uid());

create policy "read own poll votes" on public.poll_votes
  for select to authenticated using (user_id = auth.uid());
create policy "add own poll votes" on public.poll_votes
  for insert to authenticated with check (user_id = auth.uid());

create policy "add own reports" on public.reports
  for insert to authenticated with check (user_id = auth.uid());

create policy "read own lunch ratings" on public.lunch_ratings
  for select to authenticated using (user_id = auth.uid());

create policy "read settings" on public.settings
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Views (what the app reads). None of them include author_id or email.
-- ---------------------------------------------------------------------------

create view public.feed_posts as
select
  p.id,
  p.channel,
  p.body,
  p.created_at,
  coalesce((select sum(v.value) from public.votes v where v.post_id = p.id), 0)::int as score,
  (select count(*) from public.comments c where c.post_id = p.id and c.status = 'live')::int as reply_count,
  (select v.value from public.votes v where v.post_id = p.id and v.user_id = auth.uid()) as my_vote,
  (p.author_id = auth.uid()) as is_mine,
  exists (select 1 from public.poll_options o where o.post_id = p.id) as is_poll
from public.posts p
where p.status = 'live';

create view public.thread_comments as
with base as (
  select
    c.id, c.post_id, c.author_id, c.body, c.status, c.created_at,
    p.author_id as op_id,
    min(c.created_at) over (partition by c.post_id, c.author_id) as first_at
  from public.comments c
  join public.posts p on p.id = c.post_id
  where p.status = 'live'
)
select
  b.id,
  b.post_id,
  case when b.status = 'live' then b.body else null end as body,
  b.status,
  b.created_at,
  (b.author_id = b.op_id) as is_op,
  (b.author_id = auth.uid()) as is_mine,
  case when b.author_id = b.op_id then null
    else dense_rank() over (
      partition by b.post_id, (b.author_id = b.op_id)
      order by b.first_at, b.author_id
    )
  end as anon_number
from base b;

create view public.poll_results as
select
  o.id as option_id,
  o.post_id,
  o.label,
  o.position,
  (select count(*) from public.poll_votes pv where pv.option_id = o.id)::int as votes,
  exists (select 1 from public.poll_votes pv where pv.option_id = o.id and pv.user_id = auth.uid()) as mine
from public.poll_options o
join public.posts p on p.id = o.post_id
where p.status = 'live';

create view public.lunch_averages as
select
  day,
  lunch,
  round(avg(score)::numeric, 1) as avg_score,
  count(*)::int as ratings
from public.lunch_ratings
group by day, lunch;

-- Views are read-only for students. (A simple view like feed_posts would
-- otherwise accept updates and deletes that pass straight through to posts.)
revoke all on public.feed_posts, public.thread_comments, public.poll_results, public.lunch_averages from authenticated, anon, public;
grant select on public.feed_posts, public.thread_comments, public.poll_results, public.lunch_averages to authenticated;
comment on view public.feed_posts is 'Intentionally security definer: hides author_id from students. Not readable by anon.';
comment on view public.thread_comments is 'Intentionally security definer: hides author_id from students. Not readable by anon.';
comment on view public.poll_results is 'Intentionally security definer: vote counts only. Not readable by anon.';
comment on view public.lunch_averages is 'Intentionally security definer: averages only. Not readable by anon.';

-- Students never write to posts, comments, poll options, settings, or lunch ratings directly.
revoke insert, update, delete, truncate on public.posts, public.comments, public.poll_options, public.settings, public.lunch_ratings from anon, authenticated;
revoke all on public.posts, public.comments, public.poll_options, public.profiles, public.votes, public.poll_votes, public.reports, public.lunch_ratings, public.settings from anon;

revoke truncate on public.profiles, public.votes, public.poll_votes, public.reports from authenticated;
revoke insert, delete on public.profiles from authenticated;

-- Lock down helper functions.
alter function public.current_senior_year() set search_path = '';
alter function public.grad_year_from_email(text) set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_report() from public, anon, authenticated;
