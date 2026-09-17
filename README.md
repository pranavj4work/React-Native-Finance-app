# Finora

Personal finance app built using React Native & TypeScript. Track income and expenses, set category budgets, and read monthly reports — all stored locally with SQLite.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (SDK 54). On first launch, choose **Start with demo data** so Home and Reports are populated.

## What it does

- Add / edit / delete transactions (income or expense)
- Categories with color + icon, including custom ones
- Chronological list with search, type filter, month or date range
- Swipe-to-delete and long-press actions
- Dashboard: this month’s income, expenses, balance, budget warnings, recent activity
- Reports: category pie chart, percentages, 6-month income vs expense bars
- Monthly budgets with 80% / 100% warnings
- Recurring weekly or monthly transactions
- CSV export via the share sheet
- Light / dark / system theme and INR / USD / EUR / GBP
- Onboarding and empty states

## Architecture

```
src/
  components/     reusable UI
  screens/        one screen per route
  hooks/          derived data
  store/          Zustand write-through cache
  services/       SQLite repositories + CSV + recurring engine
  types/          domain models
  utils/          currency, dates, filters, Zod schemas
  constants/      default categories
  theme/          light/dark tokens
  navigation/     typed stack + tabs
```

**Stack:** Expo 54, TypeScript, React Navigation, Zustand, expo-sqlite, React Hook Form + Zod, dayjs, Gifted Charts.


