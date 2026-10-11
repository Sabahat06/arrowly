# Arrowly website

The official website for **Arrowly**, made for GitHub Pages. It includes:

| File | What it is |
|---|---|
| `index.html` | Landing page with a playable mini puzzle, features, screenshots and FAQ |
| `privacy-policy.html` | Privacy Policy (same text as the app's Settings → Privacy Policy) |
| `terms.html` | Terms of Use |
| `app-ads.txt` | **Required by AdMob** to verify the app |
| `404.html` | "Page not found" page |
| `.nojekyll` | Makes GitHub serve every file exactly as it is |

## 1. Upload to GitHub (important: use the special repository name)

AdMob only reads `app-ads.txt` from the **root of the domain**, for example
`https://yourname.github.io/app-ads.txt`. That only works with a repository named
exactly **`YOUR-USERNAME.github.io`**. A repo with any other name serves the files
from a subfolder, and AdMob will not find them.

1. Sign in to GitHub. Click **+ → New repository**.
2. Repository name: `YOUR-USERNAME.github.io`, replacing YOUR-USERNAME with your
   GitHub username in lowercase. Set it to **Public** and click **Create repository**.
3. Click **uploading an existing file**. Drag in **everything inside this
   `website` folder**, not the folder itself. That includes the `assets` folder and
   the hidden `.nojekyll` file (on a Mac, press Cmd+Shift+. in Finder to see hidden
   files). Click **Commit changes**.
4. Open **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a
   branch**, then branch **main** and folder **/ (root)**, then **Save**.
5. After 1–2 minutes, the site is live at `https://YOUR-USERNAME.github.io/`.

**Check:** `https://YOUR-USERNAME.github.io/app-ads.txt` must show this line:

```
google.com, pub-8461131009993518, DIRECT, f08c47fec0942fa0
```

## 2. Replace the placeholder address

Open each `.html` file (on GitHub you can click the file, then the pencil icon to
edit it) and replace `YOUR-USERNAME` with your GitHub username. It is only used
in the link-preview tags at the top of each page.

## 3. Google Play Console

- **Store presence → Store settings → Website:** `https://YOUR-USERNAME.github.io`
  AdMob uses this website to find `app-ads.txt`, so it must be exactly this domain.
- **Policy → App content → Privacy policy:**
  `https://YOUR-USERNAME.github.io/privacy-policy.html`
- **Store settings → Email:** miansabahat10@gmail.com

## 4. AdMob

After the app is live on Google Play:
**AdMob → Apps → Arrowly → App settings → Add app store details**, then select
the app. AdMob checks `app-ads.txt` within about a day, then reviews the app.

## 5. When the app is live on Google Play

Open `assets/js/main.js` and change line 4 to:

```js
const PLAY_STORE_LIVE = true;
```

All "Coming soon" buttons then change to "Get it on Google Play" and link to the
store listing.

## Keep in sync

If the app starts collecting anything new, update both
`lib/core/privacy_policy.dart` in the app and `privacy-policy.html` here.
