# dōTERRA Pro — onboarding copy

Every editable string, in running order. Identical across both versions
(V1 reskin and V2) — they share `src/data/copy.ts`, which this is generated
from, so it matches what ships.

Card and dashboard artwork is excluded: that copy is baked into the exported
PNGs and can only be changed by re-exporting from Figma.

---

## 1 · Splash

- Wordmark — dōTERRA Pro
- Subtitle — Welcome to your Business Mobile App
- Primary button — Log in
- Secondary button — Take a Tour First

## 2 · Log in

- Title — Log in
- Subtitle — Log in to my account
- Field label — Email / Member ID
- Field placeholder — Enter your email or member ID...
- Field label — Password
- Field placeholder — Enter your password...
- Primary button — Log in
- Secondary button — Use Face ID
- Link — Forgot password?

## 3 · Loading / welcome

- Wordmark — dōTERRA Pro
- Greeting line 1 — Welcome,
- Greeting line 2 — Emma

## 4 · Onboarding — Pro Advisor

- Eyebrow — Pro Advisor  *(shown uppercase)*
- Headline — Powerful Pro Business Advice, Powered by AI
- Body — Your personal dōTERRA AI advisor, powered by live business data
- Skip link — Skip

## 5 · Onboarding — Pro Dashboard

- Eyebrow — Pro Dashboard  *(shown uppercase)*
- Headline — Your progress, in one view
- Body — Your business dashboard helps you stay on top of your compensation, uncover valuable insights, and see reward progress as your business grows.
- Skip link — Skip

## 6 · Onboarding — AI Business Insights

- Eyebrow — AI Business Insights  *(shown uppercase)*
- Headline — Take action on AI insights
- Body — Receive intelligent observations that highlight opportunities, surface important tasks, and help you make smarter business decisions.
- Skip link — Skip

## 7 · Onboarding — My Team

- Eyebrow — My Team  *(shown uppercase)*
- Headline — Help your team grow
- Body — Manage your organisation with confidence, track performance, and strengthen relationships through meaningful engagement.
- Skip link — Skip

## 8 · Onboarding — My Tasks

- Eyebrow — My Tasks  *(shown uppercase)*
- Headline — Your business to-do list
- Body — Create your own tasks or generate personalised to-dos from AI Insights and Pro Advisor, keeping everything organised in one place.
  - *“Pro Advisor” is bold within the sentence.*
- Skip link — Skip
- Toast title — Task created from insight
- Toast body — We'll remind you before it's due, and let you know when the contact responds.

---

## Notes

Two strings deliberately differ from the Figma file, both agreed as typos:

| Slide | Figma | Here |
|---|---|---|
| 4 body | `doTERRA` | `dōTERRA` |
| 8 body | `Ai Insights` | `AI Insights` |

Slide 4's eyebrow is **Pro Advisor**; frame `16179:29705` still renders the
old shared line “TOOLS TO HELP YOU”.
