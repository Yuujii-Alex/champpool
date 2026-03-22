# ChampPool

ChampPool analyzes recent League of Legends solo queue games and recommends a tighter champion pool based on role, match history, win rate, and mastery.

This is a personal student project built to hone my coding skills and practice turning game data into a small product. The recommendations are intentionally lightweight and heuristic-driven, so they should be treated as guidance rather than authoritative advice.

## Setup

Create your local environment file first:

```bash
cp .env.example .env.local
```

Required environment variable:

- `RIOT_API_KEY`
- The one used on my vercel page only works for 24 hours!

Optional Redis cache variables:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ANALYSIS_CACHE_TTL_SECONDS` defaults to `300`

If Redis is not configured, the app falls back to live Riot requests.

## Commands

```bash
npm run dev
npm run build
npm run lint
```

## Redis Cache

When Upstash Redis variables are present, ChampPool caches the final player analysis result by region and Riot ID. This reduces duplicate Riot API traffic for repeated lookups without changing the rest of the app flow.

The cache is intentionally short-lived so recommendations stay reasonably fresh.

## Notes

- Match analysis uses recent solo queue matches only.
- Champion and profile images come from Riot Data Dragon and CommunityDragon assets.
- The home page and the recommend API route share the same analysis logic and cache path.

## Legal

ChampPool was created under Riot Games' Legal Jibber Jabber policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.

## License

The source code in this repository is licensed under the MIT License. See `LICENSE` for details.

Riot-owned assets, trademarks, and other third-party content are not covered by that license and remain subject to Riot's terms and policies.
