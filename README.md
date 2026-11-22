# HelperMeet mobile UI prototype

Neighbors find chances to serve the people around them, and ask for help themselves.

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8770 --directory Prototype
```

Open http://localhost:8770. On a wide screen the phone sits beside a panel of prototype controls; under 740px wide the app fills the screen and the same controls move to Settings → Prototype tools.

## What you can try

- **Sign up and set a boundary.** Get started → name, email, address → pick one of the neighborhoods that enclose your home, set a radius, or draw your own by tapping points on the map and tapping the first point to close it. A drawn boundary must contain the home marker, cannot cross itself, needs a unique name, and is then listed for others. A radius is private and never listed. Change it later in Settings → My neighborhood.
- **Sample account.** "Load sample account" signs in as James Jackson with requests in every state (expiring in 2 days, check-in due, completed, expired) and chats in every state (accepted, waiting, two incoming offers).
- **Lend a hand.** My boundary / Within 1 mile, map / list (closest first). Only other people's requests appear here. Pins that would overlap merge into a numbered cluster; orange pins are needed within 3 days; an outlined check means help is already arranged. Tap a pin or row for details, then message the neighbor to offer help.
- **Ask** (center button). Title, kind of help, description, time and helpers needed, what to bring, good times, photos, optional deadline, and who can see it (my boundary by default, or anyone within a mile, with a caution about sharing vulnerable details).
- **Messages.** New people arrive as offers. Accept reveals full names both ways. "No thanks" passes politely and blocks nobody. "Report or block" is a separate choice on every offer, chat (⋯ menu) and request. In a chat about your own request, "Count as helper" records who is helping. Chats take text and photos; a pending offer of yours can be withdrawn.
- **My requests.** Active and past. Mark completed (asks who helped and sends your thanks), edit, delete, extend (1, 2, 3 weeks or 30 days, offered from 3 days before expiry), renew an expired one.
- **Settings.** Verify your address (simulated), change boundary, blocked neighbors, notifications.

Prototype controls: simulate an incoming offer of help, have neighbors accept your pending offers, fast-forward 1 day or 1 week (to see reminders and the 30-day expiry), and move your current location away from home (the 1-mile view and list distances follow where you are; the boundary view follows your home).

## Rules the prototype implements

- Names show as first name plus masked last name ("James J***n") everywhere until a chat between two people is accepted.
- A neighbor's request is visible if they shared it with anyone, or your home is inside the boundary they shared it with. "My boundary" shows visible requests located inside your boundary; "Within 1 mile" shows visible requests within a mile of your current location.
- Passing on an offer ("No thanks") removes just that offer. Blocking is deliberate and separate: it removes your conversation with the person, stops their offers and messages, and hides their requests until you unblock them in Settings. Reporting a request hides it from you and can block its owner in the same step.
- Each request shows how many helpers are lined up ("1 of 2 helpers found", then "Help arranged"), so neighbors can see what is still needed.
- People carry a "Verified neighbor" mark once their address is verified; otherwise "Address not verified".
- Requests expire 30 days after posting. From 3 days before, the owner is prompted to extend or mark it done; with no answer it moves to Past as expired and can be renewed.
- A separate "still need help?" check-in appears when a deadline passes, two days after someone's offer is accepted, or after a week with no check-in. Reminder banners are limited to one every ten minutes.
- Completing a request sends your thank-you to the helpers you tick, tells your other chats about it that you are all set, and answers any still-open offers.

## Wording

The thing people post is called a "request" and a neighbor's reply is an "offer". The noun is defined once, as `N` at the top of `js/helpermeet.js`; change it there (for example to "opportunity") and every screen follows.

## Accessibility baseline

Interface text is 12px or larger, tap targets are at least 44px, body and secondary text meet 4.5:1 contrast, destructive actions use a red distinct from the orange used for urgency, map pins are keyboard-focusable buttons with descriptive labels, and sheets trap and return focus. Not done: text does not follow the system text-size setting, and drawing a boundary is pointer-only (choosing a listed boundary or a radius are the keyboard alternatives).

## What is simulated

There is no backend. The map is a drawn, fictional neighborhood (1000 map units = 1 mile) and any address is placed at the same home point. Other neighbors, their replies and their acceptance of your offers are scripted. Sample neighbors' requests renew themselves instead of expiring so the neighborhood stays populated when you fast-forward. Notifications are in-app banners only. Address verification and reports are simulated; nothing is mailed or sent. Map pins show an approximate spot, not an address. Everything, including photos (downscaled to 900px), is saved in this browser's local storage under `helpermeet-v2`; "Start over at sign-up" clears it.

## Files

- `index.html` — page shell and the prototype controls.
- `css/helpermeet.css` — styles.
- `js/hm-data.js` — geometry helpers, the map component, sample people, boundaries and requests.
- `js/helpermeet.js` — screens, navigation, and the simulated backend.
- `sw.js`, `manifest.json`, `icon.svg` — offline install (network first, cache as fallback).
