---
title: "Backtesting 101: How to Validate a Trading Strategy Before Going Live"
excerpt: "Backtesting is the process of running a trading strategy against historical data to evaluate its performance before risking real capital. Here's what it is, how it works, and the most common ways it misleads you."
date: "2026-03-25"
readingTime: "8 min read"
tags: ["Backtesting", "Algorithmic Trading", "Trading Strategy", "Go", "Wisp"]
author: "Wisp Team"
featured: false
---
# Backtesting 101: How to Validate a Trading Strategy Before Going Live
The most expensive mistakes in algorithmic trading are the ones you only discover after deploying live. Backtesting is the process of testing a strategy against historical data before it touches real capital — the closest thing to a flight simulator that trading has.
This guide covers what backtesting is, how a proper backtest works, what the results mean, and the failure modes that cause well-backtested strategies to underperform in production.
---
## What Is Backtesting?
A backtest is a simulation. You take a trading strategy — a set of rules for when to enter and exit positions — and run it against a historical price dataset as if those trades had been executed in real time.
The output is a performance report: total return, drawdown, win rate, Sharpe ratio, and other metrics that tell you whether the strategy had edge over the period you tested.
The core assumption is that historical performance is predictive of future performance. This assumption is often wrong, which is why backtesting is a necessary but not sufficient condition for a strategy to be worth deploying.
---
## The Components of a Backtest
A minimal backtesting system needs four things:
**1. Historical data.** OHLCV (open, high, low, close, volume) kline data is the standard input. The quality of your data — gaps, survivorship bias, split adjustments — directly affects the quality of your results.
**2. Strategy logic.** The same entry and exit conditions you'd implement live: indicator thresholds, signal conditions, position sizing rules.
**3. Execution simulation.** How your orders fill. The simplest model assumes you fill at the close of the candle that triggered the signal. More realistic models account for slippage and partial fills.
**4. A performance evaluator.** The calculation layer that takes your simulated trade history and produces the metrics you care about.
---
## Key Backtesting Metrics
### Total Return and CAGR
Total return is the percentage gain over the backtest period. Compound Annual Growth Rate (CAGR) normalises it to a per-year figure so strategies over different time windows are comparable.
### Maximum Drawdown
The maximum drawdown (MDD) is the largest peak-to-trough decline in equity during the backtest. It tells you the worst-case loss you would have experienced if you'd bought at the peak and sold at the trough.
MDD is the most psychologically important metric. A strategy with 40% CAGR and 70% maximum drawdown is essentially undeployable for most traders.
### Sharpe Ratio
The Sharpe ratio measures return per unit of volatility: `(annualised return - risk-free rate) / annualised standard deviation of returns`. A Sharpe above 1.0 is acceptable; above 2.0 is good; above 3.0 should be scrutinised heavily for overfitting.
### Win Rate vs. Profit Factor
Win rate alone is often misread. A strategy with a 40% win rate can be highly profitable if winning trades are significantly larger than losing ones. The profit factor — `total gross profit / total gross loss` — is the more useful metric. Anything above 1.5 is worth investigating.
---
## The Three Ways Backtests Lie
### 1. Overfitting (Curve Fitting)
Overfitting happens when a strategy is tuned to fit specific historical data, capturing noise rather than signal. The symptom: spectacular backtests, mediocre live results.
The mitigation: **out-of-sample testing**. Develop on in-sample data (e.g. 2020–2023). Test without modification on out-of-sample data (e.g. 2024). Out-of-sample results are a far more honest estimate of live performance.
### 2. Look-Ahead Bias
Look-ahead bias occurs when your backtest accidentally uses future information to make past decisions. A common example: using the daily close price to generate a signal that's supposed to trigger at the open. Modern backtesting frameworks prevent this with strict bar indexing, but if you're building your own simulation, this is the most subtle bug to introduce.
### 3. Survivorship Bias
If you're backtesting on assets that exist today, you're automatically excluding assets that delisted or went to zero. This biases your results upward. For crypto, survivorship bias is particularly acute — many tokens from 2019–2021 are now worthless.
---
## Paper Trading vs. Backtesting
Backtesting runs against historical data; paper trading runs in real time with live market data but without real capital. Both are validation tools with different trade-offs.
Backtesting is fast — you can test 3 years of history in seconds. Paper trading takes real time but eliminates look-ahead bias and tests real fill mechanics. See [Paper Trading vs. Backtesting](/posts/paper-trading-vs-backtesting) for a full comparison.
The right workflow:
1. Backtest on a multi-year in-sample window
2. Walk-forward test on out-of-sample data
3. Paper trade for several weeks to validate live execution
4. Deploy with small size and scale up as results confirm expectations
---
## Backtesting in Wisp

[Wisp](https://usewisp.dev) is built for **live production trading** — the part that comes after a strategy has been validated. Backtesting support is on the 2026 roadmap and will use the same strategy interface as live trading, so you write the strategy once and run it in either mode.

Until that ships, the recommended workflow is:

1. **Validate in Python** using vectorbt or backtrader with historical OHLCV data from your target exchanges
2. **Port the live strategy to Wisp** — indicator logic translates directly. RSI(14), MACD(12,26,9), and Bollinger Bands(20,2) are the same calculation in any language
3. **Paper trade with Wisp** before deploying real capital (see [Paper Trading vs. Backtesting](/posts/paper-trading-vs-backtesting))
4. **Deploy live** — Wisp's process model runs each strategy in an isolated OS process with persistent state and clean crash recovery

Once you're ready to go live, the Wisp strategy looks like this:

```go
func (s *RSIStrategy) run(ctx context.Context) {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()

    pair := s.wisp.Pair(s.wisp.Asset("BTC"), s.wisp.Asset("USDT"))
    s.wisp.Perp().WatchPair(connector.Hyperliquid, pair)

    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            klines := s.wisp.Perp().Klines(connector.Hyperliquid, pair, "1h", 14)
            rsi, err := s.wisp.Indicators().RSI(klines, 14)
            if err != nil {
                continue
            }

            if rsi.LessThan(numerical.NewFromInt(30)) {
                signal := s.wisp.Perp().Signal(s.GetName()).
                    Buy(pair, connector.Hyperliquid, numerical.NewFromFloat(0.05)).
                    Build()
                s.wisp.Emit(signal)
            } else if rsi.GreaterThan(numerical.NewFromInt(70)) {
                signal := s.wisp.Perp().Signal(s.GetName()).
                    Sell(pair, connector.Hyperliquid, numerical.NewFromFloat(0.05)).
                    Build()
                s.wisp.Emit(signal)
            }

            s.EmitStatus(strategy.StrategyStatus{
                Summary: "RSI evaluated",
                Metadata: map[string]interface{}{"rsi": rsi.String()},
            })
        }
    }
}
```

The indicator thresholds you tuned during backtesting map directly into this code. No reimplementation. Full SDK reference: [usewisp.dev/docs](https://usewisp.dev/docs)
---
## Related Reading
- [Go Algorithmic Trading Framework: Build Crypto Bots That Run in Production](/posts/introducing-wisp)
- [Paper Trading vs. Backtesting: Which One Do You Need?](/posts/paper-trading-vs-backtesting)
- [How to Build Your First Trading Bot in Go](/posts/how-to-build-trading-bot-go)
