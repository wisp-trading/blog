---
title: "What is Polymarket? A Crypto Trader's Guide to Prediction Markets"
excerpt: "Polymarket lets you trade YES/NO contracts on real-world events using a central limit order book. Here's how it works, how positions resolve, and how it compares to trading on a crypto exchange."
date: "2026-03-10"
readingTime: "6 min read"
tags: ["Polymarket", "Prediction Markets", "Crypto", "Go"]
author: "Wisp Team"
featured: false
---

# What is Polymarket? A Crypto Trader's Guide to Prediction Markets

If you've spent time trading crypto you already understand order books, bid/ask spreads, and position management. Prediction markets use the same mechanics — but instead of trading BTC/USDT, you're trading the probability that something happens in the real world.

Polymarket is the largest prediction market running on crypto rails today. Billions of dollars in volume have flowed through it across elections, macro events, sports, and anything else with a binary outcome and a deadline. This guide explains how it works from a trader's perspective: the pricing model, the order book, how positions resolve, and how PnL actually gets realised.

---

## What Is a Prediction Market?

A prediction market is an exchange where contracts pay out based on whether a real-world event occurs. If you're right, your contract pays $1.00. If you're wrong, it expires worthless.

The market price of a contract at any moment reflects the collective implied probability of that outcome. A contract trading at $0.63 means the market believes there's roughly a 63% chance the event happens. If you think the true probability is higher, you buy. If you think it's lower, you sell.

This is structurally identical to options pricing—except there's no underlying asset, no expiry decay, and no Black-Scholes. The contract is binary: it either pays $1.00 or $0.00.

---

## How Polymarket Works

### YES/NO Contracts and the $0–$1 Range

Every market on Polymarket resolves to one outcome. Binary markets—the most common type—have two tradeable contracts: YES and NO. Between them, they always sum to $1.00:

```
YES price + NO price = $1.00
```

If YES is trading at $0.72, NO is trading at $0.28. This relationship is enforced by arbitrageurs and the settlement mechanics.

Prices are denominated in USDC. You buy shares at a price between $0 and $1, and each share pays out exactly $1.00 if the outcome resolves in your favour.

### Conditional Tokens (ERC-1155)

Under the hood, Polymarket positions are ERC-1155 conditional tokens on Polygon. When you buy 100 YES shares at $0.72, you receive 100 YES tokens. These tokens are your claim. When the market resolves:

- If YES wins: each token redeems for $1.00 USDC
- If NO wins: your tokens expire worthless

The token format is what makes Polymarket non-custodial—your position lives in your wallet, not on a centralised book. You can transfer it, sell it back on the CLOB, or hold it to resolution.

### The Central Limit Order Book (CLOB)

Polymarket runs a Central Limit Order Book (CLOB) for price discovery. This will be immediately familiar if you've traded on any crypto exchange. Makers post limit orders at specific prices; takers fill against the book.

The key difference from a crypto CLOB: you're not trading an asset that has intrinsic value. You're trading a probability. The order book for a YES contract looks like this:

```
Asks (sellers of YES)
  0.76  —  1,200 shares
  0.75  —  3,400 shares
  0.74  —  800 shares
────────────────────────
  0.73  —  2,100 shares
  0.72  —  5,600 shares
  0.71  —  900 shares
Bids (buyers of YES)
```

A taker buying YES at market pays $0.74 per share (the best ask). A taker selling YES (equivalently, buying NO) hits the best bid at $0.73.

Bid/ask spread on liquid Polymarket markets is typically 1–3 cents, which translates directly to 1–3 percentage points of implied probability. On illiquid markets, spreads can be 5–10 cents or wider.

### Implied Probability and How to Read a Market

The mid-price of a YES contract is the market's implied probability. A few things worth noting:

**The spread is your cost to enter and exit.** On a market with YES bid/ask of 0.72/0.74, you pay $0.74 to open and receive $0.72 to close—a round-trip cost of $0.02 per share, before fees.

**Liquidity varies enormously.** High-profile markets (presidential elections, major macro events) run hundreds of millions in volume with tight spreads. Niche markets may have wide spreads and shallow books.

**Price can stay wrong for a long time.** Unlike crypto prices, which are continuously anchored to other markets, Polymarket prices can drift from true probability if liquidity is thin. This is where edge lives—and where automation is useful.

---

## How Positions Resolve

### The UMA Oracle

When a market's resolution deadline passes, Polymarket uses the [UMA optimistic oracle](https://uma.xyz) to determine the outcome. UMA works on a propose-and-dispute model:

1. A proposer submits a resolution (YES or NO) along with a bond.
2. There is a challenge window during which anyone can dispute the resolution by posting a counter-bond. The window length varies by market type — standard markets typically run 2+ hours, while fast-resolution markets (such as 5-minute interval markets) bypass UMA entirely and are resolved automatically via Chainlink.
3. If undisputed, the proposed resolution is accepted. If disputed, UMA's decentralised voter network adjudicates.

This means resolution is not instant. After a market closes, payout availability depends on the resolution mechanism. Chainlink-resolved markets (e.g. 5-minute BTC price markets) settle near-instantly. UMA-resolved markets typically take 2–24 hours depending on whether a dispute is raised.

### Resolution Criteria

Each market on Polymarket has explicit resolution criteria published at creation—the exact source, the exact threshold, the exact timestamp. These matter. "Will X happen by December 31st?" resolves based on the criteria as written, not common sense. Before entering a market, read the resolution criteria carefully. Edge cases are common and disputes happen.

### Redeeming Winnings

Once a market resolves, winning token holders must actively redeem their tokens to receive USDC. Tokens don't auto-convert. This is an on-chain transaction. If you hold 500 YES shares in a market that resolved YES, you call the redemption contract to receive 500 USDC.

**A concrete example:** You buy 500 YES shares at $0.42, spending $210 USDC. The market resolves YES. You redeem 500 shares at $1.00, receiving $500 USDC. Net profit: $290 — a 138% return on capital. If the market had resolved NO, your $210 would expire worthless. There is no partial payout and no stop-loss once the market closes.

In Wisp, redemption is handled explicitly via `wisp.Predict().Redeem(market)`. More on that below.

---

## Polymarket vs. a Crypto Exchange

| Property          | Polymarket (prediction market)          | Crypto exchange (e.g. Binance)         |
|-------------------|-----------------------------------------|----------------------------------------|
| Asset type        | Conditional token (probability, 0–1)   | Spot asset or perpetual contract       |
| Settlement        | Binary: $1.00 or $0.00 at resolution   | Continuous mark price                  |
| Order types       | Limit, market (CLOB)                   | Limit, market, stop, OCO               |
| Expiry            | Fixed resolution date per market       | Perpetuals have no expiry              |
| Custody           | Non-custodial (ERC-1155 in your wallet)| Custodial (exchange holds funds)       |
| Profit mechanism  | Buy low probability, sell high—or hold to $1 | Price appreciation, funding, basis |
| Settlement source | UMA oracle or Chainlink (by market type) | Exchange price feed                  |
| Fees              | Feeless on most markets; fees apply on fast-resolution (5-min) markets | Tiered maker/taker (0.01%–0.1%) |

---

## Where Wisp Fits In

Wisp has a native Polymarket connector via the `Predict()` domain interface. It connects directly to Polymarket's CLOB, streams live orderbook data, and handles order placement and redemption.

The interface treats prediction markets as a first-class market type alongside spot and perpetuals. You look up a market by its Polymarket slug, register it on a watchlist, read the orderbook for a specific outcome (YES or NO), and place orders with a price expressed as a probability between 0 and 1:

```go
func (s *myStrategy) run(ctx context.Context) {
    // Fetch the market by its Polymarket slug
    market, err := s.k.Predict().GetMarketBySlug("will-btc-reach-100k-in-2026", connector.Polymarket)
    if err != nil {
        return
    }

    // Register it so the ingestor starts streaming orderbook data
    s.k.Predict().WatchMarket(connector.Polymarket, market)

    yesOutcome := market.Outcomes[0] // YES

    ticker := time.NewTicker(10 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            ob, err := s.k.Predict().Orderbook(connector.Polymarket, market, yesOutcome)
            if err != nil {
                continue
            }

            // ob.Bids and ob.Asks are prices expressed as probabilities (0.0–1.0)
            // Place a buy if the ask is below your fair value estimate
            signal, _ := s.k.Predict().PredictionSignal(s.GetName()).
                Buy(market, yesOutcome, connector.Polymarket,
                    numerical.NewFromFloat(100),   // shares
                    numerical.NewFromFloat(0.65),  // max price (65¢ per share)
                    time.Now().Add(5*time.Minute).Unix(),
                ).
                Build()

            s.k.Emit(signal)
        }
    }
}
```

Positions are tracked as `PredictionOrder` records, with `Price` stored as the probability at placement (0.0–1.0), `Shares` as the quantity, and `RealizedPnL` populated once the market resolves and `Redeem()` is called. Unrealised PnL is calculated against the current orderbook mid-price.

For markets that recur on a fixed schedule—daily BTC price markets, for example—Wisp supports `GetRecurringMarketBySlug` with a `RecurrenceInterval`, so your strategy can automatically track the current active instance without hardcoding market IDs.

---

## Frequently Asked Questions

**Is Polymarket legal?**
Polymarket is available globally, but US persons are geofenced from the platform. Polymarket previously settled with the CFTC in 2022 over operating an unregistered derivatives exchange in the US. Outside the US the legal status varies by jurisdiction — worth checking local regulations before trading.

**What is the maximum profit on a Polymarket trade?**
The maximum profit per share is the difference between $1.00 and your entry price. If you buy YES at $0.30 and the market resolves YES, you make $0.70 per share (233% return on capital). If it resolves NO, you lose your entire stake. There's no leverage—your maximum loss is what you paid.

**How is Polymarket different from sports betting?**
The mechanics look similar but the underlying model differs. Traditional sportsbooks set odds with a built-in vig (the house edge) and actively manage their exposure. Polymarket is a peer-to-peer CLOB—there's no house. You're trading against other market participants. Prices are set by supply and demand, not a bookmaker. The fee structure is also different: most markets are feeless, with fees only on specific market types such as fast-resolution 5-minute markets.

**What are the fees on Polymarket?**
Most Polymarket markets are feeless — there's no maker/taker charge on standard binary markets. The exception is fast-resolution markets (such as 5-minute interval markets), which do carry a fee. Fees are deducted from your USDC balance at execution and tracked separately in Wisp's `PNL().Fees()` method.

**Can I exit a position before resolution?**
Yes. Your YES or NO tokens can be sold back on the CLOB at any time before the market closes. If the market has moved in your favour, you can realise profit early without waiting for resolution. Liquidity permitting, you can treat Polymarket positions like any other CLOB trade.

---

## Next Steps

If you want to automate Polymarket trading—reading orderbooks, placing orders programmatically, and handling redemptions—the follow-up post walks through building a complete strategy with Wisp's `Predict()` interface: [Automating Polymarket with Wisp](/blog/automating-polymarket-with-wisp).

Full SDK reference and setup guides are at [docs.usewisp.dev](https://docs.usewisp.dev).
