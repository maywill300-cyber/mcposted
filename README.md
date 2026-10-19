# McPosted

Anonymous posts for current high school students, verified by school email.

Built with Next.js (the website) and Supabase (the database and logins), with an AI check on every post. Everything below is a one-time setup. Plan on an afternoon, plus a day of waiting for the email domain to verify.

**Before you start:** Some of these services require account holders to be 18 or older, so a parent may need to create the accounts or own them with you. You'll also need a card for the domain (about $10–20 a year) and the AI credit ($5 lasts a long time).

---

## Setup checklist

### 1. Buy a domain

Buy something like `mcposted.com` from Cloudflare, Namecheap, or Porkbun. **Don't use "mccallie" anywhere in the domain** (Blue Book p. 58).

### 2. Set up email sending (Resend)

Supabase's built-in email only sends to your own account, so real students need this step.

1. Sign up at resend.com.
2. Go to **Domains → Add Domain** and enter your domain.
3. Resend shows a few DNS records. Add them where you bought the domain. Verification can take a few minutes up to a day.
4. Go to **API Keys → Create API Key** and copy it somewhere safe.

### 3. Create the database (Supabase)

1. Sign up at supabase.com and click **New project**. Pick the East US region and save the database password somewhere.
2. Open **SQL Editor → New query**, paste in all of `supabase/schema.sql`, and click **Run**. It should say "Success."
3. Go to **Authentication → Sign In / Providers → Email**. Make sure Email is on, and set the email OTP length to **6**.
4. Go to **Authentication → Emails → SMTP Settings**, turn on custom SMTP, and enter:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: your Resend API key
   - Sender email: `login@yourdomain.com`
   - Sender name: `McPosted`
5. Go to **Authentication → Emails → Templates**. Edit **both** "Confirm signup" and "Magic Link" so they send the code instead of a link:
   - Subject: `Your McPosted code`
   - Body:
     ```html
     <h2>Your McPosted login code</h2>
     <p style="font-size:32px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
     <p>Enter this code in McPosted. If you didn't ask for it, you can ignore this email.</p>
     ```
6. Go to **Project Settings → API** (it may be called **API Keys**) and copy three values for later: the **Project URL**, the **anon public** key, and the **service_role** key. Newer projects call these the **publishable** key (use it as the anon key) and the **secret** key (use it as the service_role key). The service_role/secret key is a master key, so never share it or post it anywhere.

### 4. Get an AI key (Anthropic)

1. Sign up at console.anthropic.com.
2. Add $5 of credit under **Billing**.
3. Go to **API Keys → Create Key** and copy it.

Without this key the app still works, but every post waits for a human moderator.

### 5. Put the code on GitHub

1. Make a GitHub account if you don't have one, then create a new **private** repository called `mcposted`.
2. On the repository page, click **uploading an existing file**, drag in everything inside this folder (not the folder itself), and click **Commit changes**.

### 6. Put the site online (Vercel)

1. Sign up at vercel.com with your GitHub account.
2. Click **Add New → Project** and import the `mcposted` repository.
3. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
   | `ANTHROPIC_API_KEY` | Your Anthropic key |
   | `MODERATION_MODEL` | `claude-haiku-5-5` |
   | `LUNCH_RATINGS_OPEN_AT` | `13:40` (when lunch ratings open, 24-hour time) |

4. Click **Deploy**. It takes a couple of minutes.
5. Go to **Settings → Domains** and add your domain, then follow the DNS steps Vercel shows.
6. Back in Supabase, go to **Authentication → URL Configuration** and set **Site URL** to `https://yourdomain.com`.

### 7. Make yourself the admin

1. Open your site and sign in with your school email.
2. In Supabase **SQL Editor**, run this with your email:
   ```sql
   update public.profiles set role = 'admin' where email = 'yourname27@mccallie.org';
   ```
3. Refresh the site. **Me → Moderator queue** now shows the admin tools.

### 8. Test before you tell anyone

- **Login emails reach school inboxes.** This is the most likely thing to break. If the code doesn't show up, check spam and quarantine. School email filters sometimes hold mail from new domains for a few days.
- Post something normal. It should appear right away.
- Post something with a made-up name ("Did you see what Tyler did"). It should be blocked or held.
- Report a post from a second account and check that it shows up in the queue.
- Rate lunch after 1:40 PM on a weekday.

### 9. Set up moderators and TEPS Day

- Pick 2–3 people you trust. Once they've signed up, add them under **Moderator queue → Moderators**.
- Set the TEPS Day date in the same place. The countdown shows on the feed for the 30 days before.

---

## How it works

- **Who can join:** only `@mccallie.org` emails with a graduation year for one of the four current high school classes. Each July the window moves forward a year, so graduated seniors can still read but can't post. This is checked in the app and again in the database.
- **Anonymity:** the app reads posts through database views that leave out who wrote them. Moderators never see authors. The admin only sees an author's email on posts flagged as possible threats, so they can be reported to the school.
- **Moderation:** every post and reply runs through a word filter, then an AI check against the rules. The result is posted, blocked with a reason, held for a moderator, or marked urgent. If the AI check fails, posts are held rather than let through. Three reports hide a post. A report for a threat hides it right away. Three removed posts lock an account.
- **Limits:** 5 posts and 30 replies per hour per account. Posts are text only, 280 characters max. Heavily downvoted posts (−5) drop out of the feed.

## Changing things later

| To change | Edit |
| --- | --- |
| What the AI blocks or holds | `RULES` in `src/lib/moderation.js` |
| Words that are always blocked | `PROFANITY` in `src/lib/moderation.js` |
| Channels | `CHANNELS` in `src/lib/format.js` and `src/app/new/ComposeForm.js`, plus the check in `supabase/schema.sql` |
| When lunch ratings open | `LUNCH_RATINGS_OPEN_AT` in Vercel |
| Colors and fonts | `src/app/globals.css` |

After you edit a file on GitHub, Vercel redeploys the site automatically.

## Running it on your own computer (optional)

Install Node.js 20 or newer, copy `.env.example` to `.env.local` and fill it in, then run:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.
