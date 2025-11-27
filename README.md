# VidBucket

Upload videos → get a shareable `.mp4` link.

### Tech Stack

- Cloudflare Pages (Frontend Hosting)
- Cloudflare R2 (Video Storage)
- Cloudflare Pages Functions (Upload API)

### Deployment Notes

1. Create an R2 bucket in Cloudflare.
2. Attach a custom domain:
   `videos.vidbucket.co.uk`
3. Bind the bucket to Cloudflare Pages:
   Name: `VIDEOS_BUCKET`
4. Deploy this repo through Cloudflare Pages.
5. Visit your site → upload video → get `.mp4` link.

Enjoy!
