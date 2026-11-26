# HomeLedger — Your Household Budget, in Balance

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/fulede9394/makefun-household-budget/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/fulede9394/makefun-household-budget/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

A working household budget site, built for [make.fun's best household budget site bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457).

HomeLedger is a real planner, not a mock-up: a dashboard (income, planned
spending, unassigned money, savings rate, a donut of spending by category and
a 50/30/20 check), a planner where every income and expense line can be
edited, added or removed with live totals, savings goals with progress bars
and contributions, and plain-language budgeting guidance. Edits are saved in
the visitor's own browser (localStorage) — nothing leaves the device. It
starts with a clearly labelled sample household.

The site is plain static files under `app/` with no build step and no network
requests: it opens in desktop Chrome and on a phone. Charts are hand-drawn on
canvas by `app/charts.js`; there are no vendored libraries. `main.ts` copies
`app/` and `screenshots/` to the output directory and writes `dossier.json`
with the kit's vendored library.
