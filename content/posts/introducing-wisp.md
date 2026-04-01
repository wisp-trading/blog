---
title: "Go Algorithmic Trading Framework: Build Crypto Bots That Run in Production"
excerpt: "Wisp is an open-source Go framework for algorithmic trading. It handles exchange connectors, order routing, position tracking, and process management — so you can focus on strategy logic, not infrastructure."
date: "2026-03-10"
readingTime: "8 min read"
tags: ["Framework", "Go", "Algorithmic Trading", "Crypto", "Trading Bot"]
author: "Wisp Team"
featured: true
---

# Go Algorithmic Trading Framework: Build Crypto Bots That Run in Production

> **TL;DR**
> - Wisp is an open-source Go framework for writing and running crypto trading bots in production
> - Ships with exchange connectors for Hyperliquid, Bybit, Binance, Paradex, and Polymarket
> - Each strategy runs in its own OS process — isolated, persistent, and recoverable after restart
> - Typed strategy interface, signal builders, and indicators fail at compile time, not at market open
> - Not a backtesting UI or drag-and-drop builder — Wisp is code-first and built for engineers

---

Most algorithmic trading frameworks make the same assumptions: you're writing Python, you have a Jupyter notebook nearby, and you're comfortable duct-taping together a data pipeline, an exchange connector, a backtester, and a monitoring solution every time you start something new.

That's a reasonable default for research. It's a liability in production.

Python is fast to prototype in and slow to operate. You're context-switching between asyncio quirks, threading limitations, and the GIL whenever you need real concurrency. Deployment is a `requirements.txt` and a prayer. Every new strategy starts with the same boilerplate: re-implement the exchange connector, re-wire the signal loop, re-build the monitoring hooks.

Wisp is a Go framework for algorithmic trading — built for engineers who want to write crypto trading bots that actually hold up in production. It handles market data ingestion, order routing, position tracking, and process management so you can focus on the strategy logic itself, not the infrastructure around it.

---

## Who Is Wisp For?

Wisp is aimed at software engineers who are serious about running algorithmic trading strategies in production — not researchers prototyping in notebooks.

If you've outgrown Python-based tools like freqtrade or Jesse and want something with real concurrency, a proper type system, and deployment you can reason about, Wisp is the framework. If you're already writing Go and want to add a trading strategy without building exchange connectors and signal pipelines from scratch, Wisp gives you those primitives out of the box.

**Wisp is not the right tool if you want:**
- Drag-and-drop strategy builders
- A cloud-hosted backtester
- A no-code trading platform

Wisp is code-first and assumes you're comfortable with Go.

---

## What Wisp Gives You Out of the Box

Wisp ships with four things engineers typically spend weeks building themselves:

**A typed strategy interface.** You implement a `Start(ctx)` method containing your own run loop, and Wisp handles the rest: market data ingestion, indicator computation, order routing, and position tracking.

**Exchange connectors.** Hyperliquid, Bybit, Binance, Paradex, and Polymarket are supported across spot, perpetual futures, and prediction markets. All connectors implement the same interface per market type, so your strategy code doesn't change when you add a new venue — and adding a new connector means implementing one interface, not rewiring the framework.

**A terminal UI.** Start and stop live instances, and monitor real-time P&L, positions, and orderbook depth — all from a keyboard-driven TUI without touching a browser.

**A process model.** Each strategy runs in its own isolated OS process. The TUI can exit. The strategy keeps running. State is persisted to disk so the instance manager recovers cleanly after a restart.

---

## The Strategy Interface

A Wisp strategy is a Go struct that satisfies the `strategy.Strategy` interface. You embed `strategy.BaseStrategy`, implement `Start(ctx)`, and run your logic in a goroutine via `StartWithRunner`. The framework handles everything upstream (market data) and downstream (order routing).

Here's a complete RSI momentum strategy:

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

func NewStrategy(w wisp.Wisp) strategy.Strategy {
    return &momentumStrategy{
        BaseStrategy: strategy.NewBaseStrategy(strategy.BaseStrategyConfig{
            Name: "momentum",
        }),
        wisp: w,
    }
}

type momentumStrategy struct {
    *strategy.BaseStrategy
    wisp wisp.Wisp
}

func (s *momentumStrategy) Start(ctx context.Context) error {
    return s.StartWithRunner(ctx, s.run)
}

func (s *momentumStrategy) run(ctx context.Context) {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    btc := s.wisp.Asset("BTC")
    usdt := s.wisp.Asset("USDT")
    pair := s.wisp.Pair(btc, usdt)

    s.wisp.Perp().WatchPair(connector.Hyperliquid, pair)

    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            klines := s.wisp.Perp().Klines(connector.Hyperliquid, pair, "1h", 20)

            rsi, err := s.wisp.Indicators().RSI(klines, 14)
            if err != nil {
                continue
            }

            if rsi.LessThan(numerical.NewFromInt(30)) {
                signal := s.wisp.Perp().Signal(s.GetName()).
                    Buy(pair, connector.Hyperliquid, numerical.NewFromFloat(0.1)).
                    Build()

                s.wisp.Emit(signal)
            } else if rsi.GreaterThan(numerical.NewFromInt(70)) {
                signal := s.wisp.Perp().Signal(s.GetName()).
                    Sell(pair, connector.Hyperliquid, numerical.NewFromFloat(0.1)).
                    Build()

                s.wisp.Emit(signal)
            }

            s.EmitStatus(strategy.StrategyStatus{
                Summary: "RSI check complete",
                Metadata: map[string]interface{}{"rsi": rsi.String()},
            })
        }
    }
}
```

Four things to notice here.

First, strategies are **self-directed**. You own the run loop — the ticker interval, the tick logic, and the shutdown path via `ctx.Done()`. The orchestrator only manages lifecycle (`Start`/`Stop`); it never drives execution on your behalf.

Second, the `wisp.Wisp` interface is the only dependency. It gives you access to market data via domain-scoped objects (`s.wisp.Spot()`, `s.wisp.Perp()`, `s.wisp.Predict()`), indicators (`s.wisp.Indicators()`), and logging (`s.wisp.Log()`). Everything goes through one typed handle.

Third, indicators take pre-fetched klines, not just an asset name. You fetch klines explicitly — `s.wisp.Perp().Klines(exchange, pair, interval, limit)` — and pass them to the indicator. This keeps data fetching visible in your strategy and lets multiple indicators share the same kline window without redundant store reads.

Fourth, `Build()` returns a `Signal` directly — no error return. Signal emission is non-blocking: `s.wisp.Emit(signal)` pushes the signal into a buffered channel that the executor reads concurrently. `s.EmitStatus(...)` records a status snapshot to the ring buffer for the monitoring dashboard.

A multi-leg spot order — buy on one exchange, sell on another — is a single fluent expression:

```go
signal := s.wisp.Spot().Signal(s.GetName()).
    Buy(pair, opp.BuyExchange, quantity).
    Sell(pair, opp.SellExchange, quantity).
    Build()

s.wisp.Emit(signal)
```

---

## Indicators

The SDK ships with a standard set of technical indicators, accessible through `s.k.Indicators()`. All indicators take a `[]connector.Kline` slice — fetch klines once, reuse them across multiple calls:

```go
klines := s.wisp.Perp().Klines(connector.Hyperliquid, pair, "1h", 60)

rsi, _   := s.wisp.Indicators().RSI(klines, 14)
macd, _  := s.wisp.Indicators().MACD(klines, 12, 26, 9)
bb, _    := s.wisp.Indicators().BollingerBands(klines, 20, 2.0)
ema, _   := s.wisp.Indicators().EMA(klines, 50)
sma, _   := s.wisp.Indicators().SMA(klines, 200)
atr, _   := s.wisp.Indicators().ATR(klines, 14)
stoch, _ := s.wisp.Indicators().Stochastic(klines, 14, 3)
```

All indicators return typed `numerical.Decimal` values (or result structs for multi-value indicators like MACD and Bollinger Bands). You call `.LessThan()`, `.GreaterThan()`, `.Add()`, etc. directly — no float64 comparisons, no precision bugs from plain arithmetic.

---

## Exchange Support

Wisp organises exchange support into three market types — **spot**, **perpetual futures**, and **prediction markets** — each with its own domain interface (`Spot`, `Perp`, `Predict`). Within a market type, every connector implements the same interface, so swapping or adding an exchange requires no changes to strategy code.

| Exchange    | Spot | Perpetuals | Prediction |
|-------------|------|------------|------------|
| Hyperliquid | ✅   | ✅         |            |
| Bybit       | ✅   | ✅         |            |
| Binance     | ✅   | ✅         |            |
| Paradex     |      | ✅         |            |
| Polymarket  |      |            | ✅         |

Adding a new connector means implementing the connector interface for the relevant market type and registering it — no changes to the executor, signal builder, indicator pipeline, or strategy code. The architecture is intentionally open: connectors are a separate `wisp-trading/connectors` package, and the SDK consumes them through interfaces it defines.

Exchange credentials live in `exchanges.yml`:

```yaml
exchanges:
  - name: hyperliquid
    enabled: true
    credentials:
      api_key: ""
      api_secret: ""

  - name: paradex
    enabled: true
    network: mainnet
    credentials:
      account_address: ""
      eth_private_key: ""
      l2_private_key: ""
```

---

## Live Trading and the Process Model

When you start a strategy from the TUI, Wisp spawns a new OS process. That process:

- Opens a Unix socket for monitoring communication
- Runs your strategy's own tick loop via `Start(ctx)`
- Routes signals to the appropriate exchange connector via `wisp.Emit(signal)`
- Tracks positions and P&L

The TUI process is entirely separate. You can close it and the strategy keeps running. Restart the TUI, and the instance manager reads state from disk and reconnects to the running process.

Each strategy instance gets a dedicated log directory at `.wisp/instances/{strategyName}/`, with separate `stdout.log` and `stderr.log` files. If a process crashes, the manager records the exit status and marks it accordingly — no silent failures.

Shutdown is graceful by default: the manager sends `SIGTERM` and waits up to 10 seconds for a clean exit before escalating to `SIGKILL`. Process groups are isolated so there's no risk of orphaned child processes surviving the strategy.

---

## The TUI

The terminal UI is built with [Bubble Tea](https://github.com/charmbracelet/bubbletea) and [Lipgloss](https://github.com/charmbracelet/lipgloss). It's keyboard-first, with vim-style navigation (`j/k`, `h/l`) throughout.

The main menu routes to four areas:

- **Strategies** — Browse and deploy strategies. Start and stop live instances directly from the keyboard.
- **Monitor** — A live dashboard showing all running instances with status, uptime, and P&L. Drill into any instance for a tabbed view: Overview, Positions, Orderbook, Trades, PnL, and Profiling metrics. Data refreshes every 3 seconds over the Unix socket.
- **Settings** — Configure exchange credentials without touching config files directly.
- **Create New Project** — Scaffold a new project directory with `config.yml`, `exchanges.yml`, and a template strategy.

---

## Why Go for Algorithmic Trading

Go isn't the obvious choice for financial software. Most quant shops default to Python for research and C++ for execution. Wisp sits in the operational middle ground — where you need something faster and more reliable than Python, but don't want to write C++.

**Concurrency is a first-class primitive.** Monitoring a process, reading a WebSocket, writing to a Unix socket, and ticking a strategy loop are all goroutines. No async/await syntax, no event loop debugging, no thread pool configuration.

**Single binary deployment.** `go build` produces a self-contained executable with no runtime dependencies. No virtual environments, no pip installs, no version conflicts between system packages. You ship a binary and it runs.

**The garbage collector is low-latency.** Go's GC targets sub-millisecond pause times. For a crypto trading bot checking signals on a tight interval, that matters. You're not stopping the world to free memory at the moment a position needs to be opened.

**Strong typing catches bugs before runtime.** The strategy interface, signal builder, and indicator library are all typed. If you call `Buy()` with the wrong argument types, the compiler tells you before you deploy. Python will tell you at 2am when the position is open.

**Interfaces make the architecture clean.** The entire framework — exchange connectors, instance managers, state stores, process spawners — is built on interfaces. Every component is independently testable and swappable.

---

## Wisp vs freqtrade vs Jesse

| | Wisp | freqtrade | Jesse |
|---|---|---|---|
| **Language** | Go | Python | Python |
| **Primary focus** | Production live trading | Backtesting + live trading | Backtesting + research |
| **Concurrency model** | Native goroutines | Single asyncio event loop | Single-threaded |
| **Deployment** | Single binary | Python environment + Docker | Python environment |
| **Strategy interface** | Typed Go interface | JSON config + Python class | Python class |
| **Exchange support** | Hyperliquid, Bybit, Binance, Paradex, Polymarket | 60+ exchanges via ccxt | Limited live exchanges |
| **Terminal UI** | Built-in TUI | Web UI | Web UI |
| **Backtesting** | Roadmap | ✅ Full support | ✅ Core feature |
| **Type safety** | Compile-time | Runtime | Runtime |
| **Process isolation** | Per-strategy OS process | Single process | Single process |

---

## Getting Started

Install Wisp:

```bash
go install github.com/wisp-trading/wisp@latest
```

Initialize a project:

```bash
mkdir my-strategy && cd my-strategy
wisp
# Navigate to: Create New Project
```

Write your strategy in `strategies/{name}/main.go` and start it live from the TUI.

Full SDK reference and strategy examples: [usewisp.dev/docs](https://usewisp.dev/docs)

---

## Frequently Asked Questions

**What is Wisp?**
Wisp is an open-source Go framework for algorithmic trading. It provides exchange connectors, a typed strategy interface, a terminal UI, and a process model for running crypto trading bots in production.

**What language is Wisp written in?**
Wisp is written entirely in Go (1.24+). Strategies are Go code — there is no configuration DSL or scripting layer.

**Is Wisp faster than freqtrade?**
For production operation, yes in most respects. Go's native concurrency, single-binary deployment, and low-latency GC make it significantly more operationally robust than a Python asyncio process. freqtrade has a much richer backtesting engine; Wisp doesn't compete on that dimension yet.

**Which exchanges does Wisp support?**
Hyperliquid, Bybit, and Binance for spot and perpetual futures. Paradex for perpetuals. Polymarket for prediction markets.

**Does Wisp support backtesting?**
Not currently. Wisp is focused on live trading and production operation. Backtesting support is on the 2026 roadmap.

**Can I run multiple strategies at the same time?**
Yes. Each strategy runs in its own OS process, fully isolated. You can run as many as you like from the TUI and monitor them all from a single dashboard.

**Do I need to know Go to use Wisp?**
Yes. Wisp is a Go framework — strategies are Go code. If you're coming from Python, the learning curve is real but the operational benefits are significant.

**Is Wisp open source?**
Yes. Wisp is open source under active development. Source, issues, and contribution guide: [github.com/wisp-trading/wisp](https://github.com/wisp-trading/wisp)

**What is the Wisp trading framework used for?**
Wisp is used for running automated crypto trading strategies in production — including momentum strategies, arbitrage, and prediction market trading — across multiple exchanges simultaneously.

**How does Wisp handle strategy crashes?**
Each strategy runs as an isolated OS process. If a process crashes, the instance manager records the exit status and marks it as stopped — no silent failures. State is persisted to disk so recovery is clean on restart.

---

Wisp is open source and under active development. If you're running production crypto strategies and tired of babysitting a Python process, [give it a star on GitHub](https://github.com/wisp-trading/wisp) or read the full SDK reference at [usewisp.dev/docs](https://usewisp.dev/docs).
