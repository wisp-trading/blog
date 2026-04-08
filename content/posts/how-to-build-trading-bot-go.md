---
title: "How to Build Your First Trading Bot in Go with Wisp"
excerpt: "A step-by-step guide to writing and deploying a live crypto trading bot using the Wisp Go framework — from project setup to a running RSI momentum strategy on Hyperliquid."
date: "2026-04-14"
readingTime: "10 min read"
tags: ["Go", "Trading Bot", "Wisp", "Algorithmic Trading", "Tutorial"]
author: "Wisp Team"
featured: false
---

# How to Build Your First Trading Bot in Go with Wisp

This is a complete walkthrough: install Wisp, scaffold a project, implement an RSI momentum strategy, and deploy it live. By the end you'll have a running bot on Hyperliquid that buys when RSI is oversold and sells when it's overbought.

Prerequisites: Go 1.24+, a Hyperliquid account with API credentials.

---

## 1. Install Wisp

```bash
go install github.com/wisp-trading/wisp@latest
```

This installs a single binary — no runtime dependencies, no virtual environment. Verify it works:

```bash
wisp --version
```

---

## 2. Scaffold a Project

```bash
mkdir rsi-bot && cd rsi-bot
wisp  # → navigate to "Create New Project"
```

Wisp generates the project structure:

```
rsi-bot/
├── config.yml          # strategy name, initial balances
├── exchanges.yml       # exchange API credentials
└── strategies/
    └── rsi/
        └── main.go     # your strategy code
```

---

## 3. Configure Your Exchange

Open `exchanges.yml` and add your Hyperliquid credentials:

```yaml
exchanges:
  - name: hyperliquid
    enabled: true
    credentials:
      api_key: "your-api-key"
      api_secret: "your-api-secret"
```

---

## 4. Understand the Strategy Interface

Every Wisp strategy is a Go struct that satisfies the `strategy.Strategy` interface. You embed `*strategy.BaseStrategy`, implement `Start(ctx)`, and write your logic in a `run` goroutine via `StartWithRunner`.

The framework injects a `wisp.Wisp` object — your single handle to all market data, indicators, signal builders, and logging.

```go
type Wisp interface {
    Indicators() analytics.Indicators
    Log()        logging.TradingLogger
    Asset(symbol string) portfolio.Asset
    Pair(base, quote portfolio.Asset) portfolio.Pair
    Emit(signal strategy.Signal)   // push signal to executor (non-blocking)
    Spot()    spotTypes.Spot
    Perp()    perpTypes.Perp
    Predict() predTypes.Predict
}
```

---

## 5. Write the Strategy

Replace `strategies/rsi/main.go` with:

```go
package main

import (
    "context"
    "time"

    "github.com/wisp-trading/sdk/pkg/types/connector"
    "github.com/wisp-trading/sdk/pkg/types/strategy"
    "github.com/wisp-trading/sdk/pkg/types/wisp"
    "github.com/wisp-trading/sdk/pkg/types/wisp/numerical"
)

// ── Strategy struct ───────────────────────────────────────────────────────────

type RSIStrategy struct {
    *strategy.BaseStrategy
    wisp wisp.Wisp
}

// ── Constructor ───────────────────────────────────────────────────────────────

func NewRSIStrategy(w wisp.Wisp) strategy.Strategy {
    return &RSIStrategy{
        BaseStrategy: strategy.NewBaseStrategy(strategy.BaseStrategyConfig{
            Name: "RSI",
        }),
        wisp: w,
    }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

func (s *RSIStrategy) Start(ctx context.Context) error {
    return s.StartWithRunner(ctx, s.run)
}

// ── Run loop ──────────────────────────────────────────────────────────────────

func (s *RSIStrategy) run(ctx context.Context) {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()

    // Build the pair we want to trade
    btc  := s.wisp.Asset("BTC")
    usdt := s.wisp.Asset("USDT")
    pair := s.wisp.Pair(btc, usdt)

    // Tell the ingestor to start streaming data for this pair.
    // This launches a background WebSocket listener — your run loop
    // doesn't need to manage it.
    s.wisp.Perp().WatchPair(connector.Hyperliquid, pair)

    for {
        select {
        case <-ctx.Done():
            return // graceful shutdown

        case <-ticker.C:
            // Fetch the latest 20 hourly klines from the ingestor's data store.
            // This is a local read — no network call in your hot path.
            klines := s.wisp.Perp().Klines(connector.Hyperliquid, pair, "1h", 20)
            if len(klines) < 14 {
                continue // not enough data yet
            }

            rsi, err := s.wisp.Indicators().RSI(klines, 14)
            if err != nil {
                s.wisp.Log().Error("RSI calculation failed", "err", err)
                continue
            }

            switch {
            case rsi.LessThan(numerical.NewFromInt(30)):
                // Oversold — buy signal
                signal := s.wisp.Perp().Signal(s.GetName()).
                    Buy(pair, connector.Hyperliquid, numerical.NewFromFloat(0.01)).
                    Build()
                s.wisp.Emit(signal) // non-blocking push to executor

            case rsi.GreaterThan(numerical.NewFromInt(70)):
                // Overbought — sell signal
                signal := s.wisp.Perp().Signal(s.GetName()).
                    Sell(pair, connector.Hyperliquid, numerical.NewFromFloat(0.01)).
                    Build()
                s.wisp.Emit(signal)
            }

            // Report status to the TUI monitoring dashboard
            s.EmitStatus(strategy.StrategyStatus{
                Summary: "RSI evaluated",
                Metadata: map[string]interface{}{
                    "rsi":    rsi.String(),
                    "signal": "none",
                },
            })
        }
    }
}
```

---

## 6. How the Signal Flow Works

When you call `s.wisp.Emit(signal)`:

1. The signal is pushed into a buffered channel — **non-blocking**, your goroutine continues immediately
2. The Wisp executor reads the channel concurrently
3. The executor dispatches the order to Hyperliquid via the exchange connector
4. Position and trade records are updated automatically

This means your run loop never waits on network I/O. The ticker fires, your logic runs in microseconds, and the order placement happens concurrently.

---

## 7. Deploy and Monitor

Start Wisp from your project directory:

```bash
wisp
```

Navigate to **Strategies → RSI → Start**. Wisp spawns the strategy as an isolated OS process. The TUI process can exit — the strategy keeps running.

Switch to **Monitor** to see:
- Live RSI value (from `EmitStatus`)
- Open positions and unrealised P&L
- Trade history
- Process uptime and health

Logs are written to `.wisp/instances/RSI/stdout.log` and `stderr.log`.

---

## 8. What to Build Next

This RSI strategy is intentionally minimal. From here, common extensions are:

**Add multiple indicators.** Wisp's indicator library includes MACD, Bollinger Bands, EMA, SMA, ATR, and Stochastic — all taking the same `[]connector.Kline` slice:

```go
klines := s.wisp.Perp().Klines(connector.Hyperliquid, pair, "1h", 60)

rsi, _  := s.wisp.Indicators().RSI(klines, 14)
macd, _ := s.wisp.Indicators().MACD(klines, 12, 26, 9)
bb, _   := s.wisp.Indicators().BollingerBands(klines, 20, 2.0)
```

**Add a second exchange.** Add one `WatchPair` call and one `OrderBook` read:

```go
s.wisp.Spot().WatchPair(connector.Bybit, pair)
bybitOB, _ := s.wisp.Spot().OrderBook(connector.Bybit, pair)
```

**Add prediction market trading.** Wisp's `Predict()` domain connects to Polymarket with the same interface pattern — see [What is Polymarket?](/blog/posts/what-is-polymarket) for the full walkthrough.

Full SDK reference: [usewisp.dev/docs](https://usewisp.dev/docs)

---

## Related Reading

- [Go Algorithmic Trading Framework: Build Crypto Bots That Run in Production](/blog/posts/introducing-wisp)
- [Why Go for Trading Bots? The Case Against Python in Production](/blog/posts/why-go-for-trading-bots)
- [Backtesting 101: How to Validate a Strategy Before Going Live](/blog/posts/backtesting-101)

