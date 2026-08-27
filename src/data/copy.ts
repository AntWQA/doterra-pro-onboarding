// All strings sourced directly from the Figma frames — see FIGMA-DEFECTS.md

export const splash = {
  title: "dōTERRA Pro",
  subtitle: "Welcome to your Business Mobile App",
  primaryCta: "Log in",
  secondaryCta: "Take a Tour First",
};

export const login = {
  title: "Log in",
  subtitle: "Log in to my account",
  emailLabel: "Email / Member ID",
  emailPlaceholder: "Enter your email or member ID...",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password...",
  loginCta: "Log in",
  faceIdCta: "Use Face ID",
  forgotPassword: "Forgot password?",
};

export const loading = {
  wordmark: "dōTERRA Pro",
  greetingLine1: "Welcome,",
  greetingLine2: "{first name}",
};

// The eyebrow used to be one shared string ("tools to help you") repeated on
// every slide; the updated frames each name their own feature. Rendered
// through `text-transform: uppercase`, so the casing here is the natural form
// rather than how it appears on screen.
//
// Slide 4 is "Pro Advisor" per the designer. The exported frame still showed
// the old shared line at the time of writing, so trust this list over a
// re-export of 16179:29705 unless that frame has caught up.
//
// Two strings deliberately DIVERGE from the Figma source, both agreed as
// typos rather than intent: frame 4's body is written "doTERRA" there,
// missing the macron every other string in the app uses, and frame 8's body
// is written "Ai Insights" against the "AI" in frame 4's headline and frame
// 6's eyebrow. Corrected here to "dōTERRA" and "AI Insights". Worth pushing
// back into the design file so the two do not drift apart again.
export const tourFrames = [
  {
    key: "advisor",
    eyebrow: "Pro Advisor",
    headline: "Powerful Pro Business Advice, Powered by AI",
    body: "Your personal dōTERRA AI advisor, powered by live business data",
  },
  {
    key: "tracking",
    eyebrow: "Pro Dashboard",
    headline: "Your progress, in one view",
    body: "Your business dashboard helps you stay on top of your compensation, uncover valuable insights, and see reward progress as your business grows.",
  },
  {
    key: "insights",
    eyebrow: "AI Business Insights",
    headline: "Take action on AI insights",
    body: "Receive intelligent observations that highlight opportunities, surface important tasks, and help you make smarter business decisions.",
  },
  {
    key: "team",
    eyebrow: "My Team",
    headline: "Help your team grow",
    body: "Manage your organisation with confidence, track performance, and strengthen relationships through meaningful engagement.",
  },
  {
    key: "tasks",
    eyebrow: "My Tasks",
    headline: "Your business to-do list",
    bodyPrefix: "Create your own tasks or generate personalised to-dos from AI Insights and ",
    bodyBold: "Pro Advisor",
    bodySuffix: ", keeping everything organised in one place.",
  },
];

export const advisorChat = {
  cardTitle: "Meet Pro Advisor",
  cardBody:
    "Your personal business guide. Set up Advisor to receive personalised insights, support and recommendations based on your business.",
  userMessage: "What's the next best action I can take for my business?",
  advisorTip: "Take 10 minutes today and write down three names of people you actually like and trust",
  advisorTipLabel: "Pro Advisor",
  inputPlaceholder: "Ask Pro Advisor",
};

export const tasksFrame = {
  advisorLabel: "Pro Advisor",
  advisorTip: "Take 10 minutes today and write down three names of people you actually like and trust",
  advisorDuration: "10 minutes",
  menu: ["Create Task", "Hide", "Open"],
  toastTitle: "Task created from insight",
  toastBody: "We'll remind you before it's due, and let you know when the contact responds.",
};

export const skip = "Skip";
