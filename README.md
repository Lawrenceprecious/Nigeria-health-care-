# HealthConnect Nigeria — Vanilla HTML/CSS/JavaScript

This is a standalone version of HealthConnect Nigeria built with normal browser files. It does not use React, TypeScript, Tailwind, Node, or a build step.

## Files

`index.html` is the homepage. `facilities.html`, `emergency.html`, `appointments.html`, `education.html`, `blood-donation.html`, and `assistant.html` are the feature pages. `styles.css` contains the complete visual design system, responsive styles, form styles, card styles, animations, and Nigerian green/white branding. `script.js` contains the interactive behavior for navigation, mobile menu, facility search and filters, form demos, quick-dial feedback, appointment specialty selection, and the local assistant chat.

## Open in VS Code

Download and extract the folder, then open `healthconnect-nigeria-vanilla` in VS Code. You can double-click `index.html` to open the site in a browser, or use the VS Code Live Server extension for a better local development experience. With Live Server installed, right-click `index.html` and choose **Open with Live Server**.

The standalone assistant uses local demo responses and the directory uses local demo facility data. To connect real records, replace the `facilities` array and response logic in `script.js` with your own API calls.

## Important

This is a frontend-only static version. It does not include the original React/tRPC backend, authentication, database connection, or production LLM integration. It is intended to give you normal editable HTML, CSS, and JavaScript files that can be opened directly in VS Code.
