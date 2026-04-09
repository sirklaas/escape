# Blob storage & media delivery (reference)

Working notes for **Great Escape** and related projects. No implementation commitment yet—use this when we decide to move videos and large assets off Git, ISP hosting, or bare `public/`.

---

## Why not only Git or home ISP?

| Approach | Pros | Cons |
|----------|------|------|
| **Git / `public/` in deploy** | Simple, versioned with the app, CDN via Vercel | Repo size; every asset change = redeploy; Hobby bandwidth limits |
| **Git LFS** | Big binaries out of normal Git objects | Everyone needs LFS; CI must pull LFS; still not a streaming CDN story by itself |
| **Self-hosted (ISP / homelab)** | Full control | Uptime; uplink; IP **reputation / blacklist** issues; no global edge |
| **Object storage + CDN** (incl. Vercel Blob) | Edge delivery, scalable, predictable URLs | Setup, cost at scale, vendor lock-in (mild for Blob) |

For **small-ish videos** and a **Vercel-hosted Next.js** app, **serving from the deployment** (`public/…`) is often enough. Choose **Blob** (or another bucket) when we want **uploads without redeploy**, **much traffic**, **very large files**, or **non-developers** managing assets.

---

## Vercel Blob (summary)

Official doc: [Vercel Blob — usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)

**What usage is measured:**

- **Storage** — monthly average size (GB-month).
- **Simple operations** — e.g. blob accessed by URL on a **cache MISS**, or `head()`. Cache **HITs** do not count as simple ops.
- **Advanced operations** — `put()`, `copy()`, `list()`, multipart parts, etc. **`del()`** is free.
- **Blob data transfer** — bytes downloaded when users view/play files.
- **Edge requests** — each access by URL counts (see [networking pricing](https://vercel.com/docs/pricing/networking)).
- **Fast origin transfer** — on cache **MISS** from origin.

**Important behavior:**

- Blobs **larger than 512 MB** are **not** edge-cached → effectively a **MISS every time** (cost + latency). Prefer chunked streaming strategies or smaller assets for typical web video.
- **Client uploads** vs **server uploads** differ for transfer charges; see the doc.
- **Dashboard** actions (browse, upload in UI) can count as **advanced operations**.

---

## Hobby vs Pro (Blob)

- **Hobby:** Blob is **free within published limits**. You **do not** pay on-demand overage; if limits are exceeded, **Blob may be unavailable** until usage resets (Vercel documents a cooldown period—verify current policy in the doc).
- **Pro:** **Metered** after included monthly credit / allowances—see Pro plan and Spend Management in Vercel docs.

Always confirm current numbers in the dashboard and the pricing page above.

---

## When to use what (for this codebase)

1. **`public/videos/…` + deploy** — Good default for **short clips**, **low change frequency**, and traffic within **Hobby** (or Pro) limits. Zero Blob SDK.
2. **Vercel Blob** — Good when we need **runtime uploads**, **frequent replacements**, or **centralized store** without redeploying the app.
3. **Cloudflare R2 / S3 + CDN** — If we want **S3-compatible** APIs, **egress** considerations at scale, or multi-cloud; more wiring than Blob on Vercel.

---

## Future implementation checklist (not started)

Use this when we “implement for real” in workflows:

- [ ] Decide **public vs Blob** per asset type (intro videos, CMS media, user uploads).
- [ ] If Blob: create store, env vars (`BLOB_READ_WRITE_TOKEN` etc.), region choice.
- [ ] Add **upload path** (client vs server) per security and [Vercel Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk) guidance.
- [ ] Replace `src` URLs in components; use **immutable filenames** (hash or version) for cache-friendly updates.
- [ ] Update **CI** (if any) and **Hobby/Pro** limits review.
- [ ] Remove or stop committing large binaries to Git where Blob replaces them (optional historical cleanup / Git LFS migration is a separate decision).

---

## Links

- [Vercel Blob overview](https://vercel.com/docs/vercel-blob)
- [Client uploads](https://vercel.com/docs/vercel-blob/client-upload) · [Server uploads](https://vercel.com/docs/vercel-blob/server-upload)
- [Public vs private storage](https://vercel.com/docs/vercel-blob/public-storage) (delivery and cost patterns)
