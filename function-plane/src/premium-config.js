// Stripe Payment Links — paste the three URLs from your Stripe Dashboard
// (Products → "Payment links"). They open in a new tab; on success, Stripe
// fires a webhook that should mark the user's profile as premium.
//
// Setup (see PREMIUM-SETUP.md or the README) — until you complete it, the
// app falls back to the placeholder dialog explaining IAP is not configured.
window.PREMIUM_LINKS = {
  monthly:  '',  // e.g. 'https://buy.stripe.com/xxxYourMonthlyLinkxxx'
  yearly:   '',
  lifetime: '',
};
