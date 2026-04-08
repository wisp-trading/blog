---
title: "Multi-Exchange Trading Bot Setup with Wisp"
excerpt: "How to monitor multiple crypto exchanges simultaneously, detect cross-exchange price discrepancies, and execute multi-leg signals — all from a single Wisp strategy."
date: "2026-03-21"
readingTime: "8 min read"
tags: ["Wisp", "Multi-Exchange", "Algorithmic Trading", "Go", "Arbitrage"]
author: "Wisp Team"
featured: false
---

# Multi-Exchange Trading Bot Setup with Wisp

One of the concrete advantages of Go's concurrency model — and a core design goal of [Wisp](https://usewisp.dev) — is the ability to monitor and trade across multiple exchanges simultaneously without the complexity that async Python would require.

This post shows how to build a multi-exchange strategy in Wisp: watching orderbooks on Binance and Bybit concurrently, detecting a spread, and executing a two-legged signal that buys on one exchange and sells on the other.

---

## How Wisp Handles Multi-Exchange Data

When you call `WatchPair` on a domain, Wisp spawns a background WebSocket listener for that exchange-pair combination. The listeners are goroutines — they run independently of your strategy loop and continuously update the shared market data store.

Your tick loop reads from the store synchronously — no await, no callbacks, no managing multiple async streams:

```go
// Start background WebSocket listeners for both exchanges
s.wisp.Spot().WatchPair(connector.Binance, pair)
s.wisp.Spot().WatchPair(connector.Bybit, pair)

// In your tick loop — both reads are local store reads, not network calls
binanceOB, okBinance := s.wisp.Spot().OrderBook(connector.Binance, pair)
bybitOB, okBybit     := s.wisp.Spot().OrderBook(connector.Bybit, pair)
```

This is a meaningful difference from Python asyncio: you don't need to manage two async tasks, handle their cancellation, or coordinate data between them. The ingestors run independently; your logic just reads.

---

## Full Multi-Exchange Strategy

Here's a complete cross-exchange spread monitor that emits a two-legged signal when the Binance ask is meaningfully below the Bybit bid — a basic cross-exchange arbitrage setup:

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

type SpreadStrategy struct {
    *strategy.BaseStrategy
    wisp      wisp.Wisp
    minSpread numerical.Decimal // minimum spread to trade
    tradeSize numerical.Decimal
}

func NewSpreadStrategy(w wisp.Wisp) strategy.Strategy {
    return &SpreadStrategy{
        BaseStrategy: strategy.NewBaseStrategy(strategy.BaseStrategyConfig{
            Name: "SpreadArb",
        }),
        wisp:      w,
        minSpread: numerical.NewFromFloat(0.002), // 0.2% minimum spread
        tradeSize: numerical.NewFromFloat(0.05),
    }
}

func (s *SpreadStrategy) Start(ctx context.Context) error {
    return s.StartWithRunner(ctx, s.run)
}

func (s *SpreadStrategy) run(ctx context.Context) {
    ticker := time.NewTicker(2 * time.Second)
    defer ticker.Stop()

    btc  := s.wisp.Asset("BTC")
    usdt := s.wisp.Asset("USDT")
    pair := s.wisp.Pair(btc, usdt)

    // Start background streams for both exchanges
    s.wisp.Spot().WatchPair(connector.Binance, pair)
    s.wisp.Spot().WatchPair(connector.Bybit, pair)

    for {
        select {
        case <-ctx.Done():
            return

        case <-ticker.C:
            // Read both orderbooks from the local data store
            binanceOB, okBinance := s.wisp.Spot().OrderBook(connector.Binance, pair)
            bybitOB, okBybit     := s.wisp.Spot().OrderBook(connector.Bybit, pair)

            if !okBinance || !okBybit {
                s.EmitStatus(strategy.StrategyStatus{Summary: "Waiting for orderbook data..."})
                continue
            }

            binanceAsk := binanceOB.BestAsk()
            bybitBid   := bybitOB.BestBid()

            // Spread = how much cheaper it is to buy on Binance vs. sell on Bybit
            spread := bybitBid.Sub(binanceAsk).Div(binanceAsk)

            s.EmitStatus(strategy.StrategyStatus{
                Summary: "Monitoring spread",
                Metadata: map[string]interface{}{
                    "binance_ask": binanceAsk.String(),
                    "bybit_bid":   bybitBid.String(),
                    "spread_pct":  spread.Mul(numerical.NewFromInt(100)).String() + "%",
                },
            })

            if spread.LessThan(s.minSpread) {
                continue // spread not wide enough
            }

            // Two-legged signal: buy on Binance, sell on Bybit — single Emit call
            signal := s.wisp.Spot().Signal(s.GetName()).
                Buy(pair, connector.Binance, s.tradeSize).
                Sell(pair, connector.Bybit, s.tradeSize).
                Build()

            s.wisp.Emit(signal) // executor dispatches both legs concurrently
        }
    }
}
```

---

## The Two-Legged Signal

The multi-leg signal is the key Wisp primitive for cross-exchange strategies. A single `Build()` call produces a signal with both legs:

```go
signal := s.wisp.Spot().Signal(s.GetName()).
    Buy(pair, connector.Binance, quantity).
    Sell(pair, connector.Bybit, quantity).
    Build()

s.wisp.Emit(signal)
```

When the executor receives this signal, it dispatches both legs concurrently via the respective exchange connectors. You don't manage two separate orders — the signal builder handles the routing.

---

## Monitoring Multi-Exchange Strategies

Each `EmitStatus` call writes to a ring buffer queryable by the Wisp TUI. In the monitoring dashboard, you can drill into the SpreadArb instance and see:

- Live spread percentage updating every 2 seconds
- Binance ask and Bybit bid side by side
- Trade history with per-leg execution details
- Realised P&L across both exchanges

This is built in — no Grafana, no custom dashboard.

---

## Adding More Exchanges

Wisp currently supports spot and perpetual futures on Hyperliquid, Bybit, and Binance, plus Paradex for perpetuals and Polymarket for prediction markets. Every connector implements the same interface, so adding a third exchange to this strategy is three lines:

```go
s.wisp.Spot().WatchPair(connector.Hyperliquid, pair)
hyperliquidOB, _ := s.wisp.Spot().OrderBook(connector.Hyperliquid, pair)
// ... include in your spread comparison logic
```

No changes to the executor, signal builder, or framework configuration.

---

## Exchange Configuration

Exchange credentials live in `exchanges.yml` in your project directory:

```yaml
exchanges:
  - name: binance
    enabled: true
    credentials:
      api_key: ""
      api_secret: ""

  - name: bybit
    enabled: true
    credentials:
      api_key: ""
      api_secret: ""
```

The Wisp runtime loads credentials at startup, initialises connectors, and makes them available through the domain interfaces. Your strategy code never references credentials directly.

---

## Getting Started

If you haven't set up Wisp yet:

```bash
go install github.com/wisp-trading/wisp@latest
mkdir spread-bot && cd spread-bot
wisp  # → Create New Project
```

Step-by-step setup guide: [How to Build Your First Trading Bot in Go with Wisp](/blog/posts/how-to-build-trading-bot-go)

Full SDK reference: [usewisp.dev/docs](https://usewisp.dev/docs)

---

## Related Reading

- [Go Algorithmic Trading Framework: Build Crypto Bots That Run in Production](/blog/posts/introducing-wisp)
- [Why Go for Trading Bots? The Case Against Python in Production](/blog/posts/why-go-for-trading-bots)
- [How to Build Your First Trading Bot in Go with Wisp](/blog/posts/how-to-build-trading-bot-go)

