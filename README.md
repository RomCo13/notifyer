# Stock Alert Notification System

This project monitors configured stock tickers and triggers alerts based on rules.

## Usage

1. Configure tickers in `config/tickers.yaml`.
2. Define alert rules in `rules/rules.json`.
3. Set API keys and tokens in `.env`.
4. Build the project with `npm run build` and start with `npm start`.

Alerts are saved in the `alerts/` directory, committed to the configured Git repo, and sent to your phone via Pushover. The push notification message lists each rule that triggered the alert so you know the reason instantly.
