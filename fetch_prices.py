"""
fetch_prices.py - Portfolio Tracker automated price fetcher
Uses Yahoo Finance v8 chart API directly (no yfinance library).
Updates price_history-2.json and appends a history entry.

Run manually:  python3 fetch_prices.py [pension_value]
  e.g.         python3 fetch_prices.py 13500
"""

import json, sys, datetime, warnings
from pathlib import Path

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
warnings.filterwarnings("ignore")

try:
    import requests
except ImportError:
    import subprocess; subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests

JSON_PATH     = Path(__file__).parent / "price_history-2.json"
TODAY         = datetime.date.today().isoformat()
TODAY_DISPLAY = datetime.date.today().strftime("%-d %b %Y")

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/json"
})
SESSION.verify = False   # bypass macOS LibreSSL / curl SSL issue

# Yahoo Finance symbols for each internal ticker
# (unit trusts use Yahoo's internal 0P codes; ETFs use .L exchange codes)
YAHOO_SYMBOLS = {
    "BCHS":  "BCHS.L",         # Invesco CoinShares Global Blockchain ETF (LSE)
    "SWDA":  "SWDA.L",         # iShares Core MSCI World ETF (LSE)
    "BNY":   "0P0000X2GH.L",   # BNY Mellon Multi-Asset Balanced Inst W Acc
    "HSBC":  "0P0000WN82.L",   # HSBC Global Strategy Balanced C Acc
    "HISL":  "0P0001IVNK.L",   # HSBC Islamic Global Equity Index IC GBP
    "LION":  "0P0000Y3Y1.L",   # Liontrust Sustainable Future Managed 6 Net
    "PMIT":  "0P0001PKIS.L",   # Premier Miton Diversified Growth D Acc
    "VLS80": "0P0000TKZM.L",   # Vanguard LifeStrategy 80% Equity A Acc
    "RLSE":  "0P000023IY.L",   # Royal London Sterling Extra Yield Bond A
    "VGAC":  "0P00018XAR.L",   # Vanguard FTSE Global All Cap Index GBP Acc
}

ISINS = {
    "BCHS": "IE00BGV5VN51", "BNY": "GB00B86LX253", "HSBC": "GB00B76WP695",
    "HISL": "LU2092164776", "LION": "GB00B8FDBQ23", "PMIT": "GB00BMQ5L211",
    "VLS80": "GB00B4PQW151", "RLSE": "IE0032571485", "SWDA": "IE00B4L5Y983",
    "VGAC": "GB00BD3RZ582",
}

# Crypto — Yahoo returns prices in GBP directly (NOT pence), so no ÷100
CRYPTO_SYMBOLS = {
    "BTC": "BTC-GBP",
    "ETH": "ETH-GBP",
    "XRP": "XRP-GBP",
    "ADA": "ADA-GBP",
}


def yahoo_search_symbol(query):
    """Search Yahoo Finance for a ticker by ISIN or name."""
    try:
        r = SESSION.get(
            f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&lang=en-GB&region=GB",
            timeout=10
        )
        for q in r.json().get("quotes", []):
            sym = q.get("symbol", "")
            if sym.endswith(".L"):
                return sym
    except Exception:
        pass
    return None


def fetch_price(ticker_label, primary_symbol, isin=None):
    """Fetch latest close price from Yahoo Finance chart API.
    Tries primary_symbol first, then searches by ISIN as fallback.
    Returns (price_gbp, price_date) or (None, None).
    """
    symbols = [primary_symbol]
    if isin:
        fallback = yahoo_search_symbol(isin)
        if fallback and fallback != primary_symbol:
            symbols.append(fallback)

    for sym in symbols:
        if not sym:
            continue
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=5d"
            r = SESSION.get(url, timeout=12)
            if r.status_code != 200:
                url2 = f"https://query2.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=5d"
                r = SESSION.get(url2, timeout=12)
            if r.status_code != 200:
                continue

            result = r.json().get("chart", {}).get("result", [])
            if not result:
                continue

            meta       = result[0].get("meta", {})
            closes     = result[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
            timestamps = result[0].get("timestamp", [])

            for i in range(len(closes) - 1, -1, -1):
                if closes[i] is not None:
                    raw  = closes[i]
                    cur  = meta.get("currency", "GBp")
                    # Yahoo returns pence (GBp/GBX) for UK securities — divide by 100
                    gbp  = round(raw / 100, 4) if cur in ("GBp", "GBX") else round(raw, 4)
                    date = datetime.datetime.utcfromtimestamp(timestamps[i]).date().isoformat()
                    print(f"  {ticker_label:8} {sym:22}  £{gbp:>10.4f}  ({date})")
                    return gbp, date

        except Exception as e:
            print(f"  {ticker_label:8} {sym} → error: {e}")

    print(f"  {ticker_label:8} ✗ no price retrieved")
    return None, None


def hval(h):
    if h.get("units") is not None and h.get("price") is not None:
        return h["units"] * h["price"]
    if h.get("manualValue") is not None:
        return h["manualValue"]
    return h.get("costBasis", 0)


def main(pension_value=None):
    with open(JSON_PATH) as f:
        d = json.load(f)

    print(f"\n{'='*60}\n  Portfolio Tracker — Price Fetch  {TODAY}\n{'='*60}\n")

    fetched = {}
    for ticker, sym in YAHOO_SYMBOLS.items():
        price, pdate = fetch_price(ticker, sym, isin=ISINS.get(ticker))
        if price is not None:
            fetched[ticker] = (price, pdate)

    if not fetched:
        print("\nERROR: No prices fetched — aborting to protect JSON.")
        sys.exit(1)

    prices_snapshot = {}
    updated = 0

    for acc in d["accounts"]:
        for h in acc["holdings"]:
            ticker = h.get("ticker")

            if h.get("pensionTracking"):
                if pension_value is not None:
                    h["prevManualValue"] = h.get("manualValue") or h.get("prevManualValue", 13120)
                    h["manualValue"]     = float(pension_value)
                    h["priceDate"]       = TODAY
                    updated += 1
                prices_snapshot[acc["id"]] = h.get("manualValue", 13120)
                continue

            if ticker and ticker in fetched:
                new_price, price_date = fetched[ticker]
                h["prevPrice"]   = h.get("price")
                h["price"]       = new_price
                h["priceDate"]   = price_date
                h["fetchStatus"] = {"ok": True, "source": f"Yahoo Finance {TODAY}"}
                prices_snapshot[f"{acc['id']}|{ticker}"] = new_price
                updated += 1
            elif ticker:
                h["fetchStatus"] = {"ok": False, "source": f"fetch failed {TODAY}"}
                if h.get("price"):
                    prices_snapshot[f"{acc['id']}|{ticker}"] = h["price"]

    # ── Crypto prices ─────────────────────────────────────────────────────────
    print("\nCrypto prices:")
    crypto_fetched = {}
    for sym_id, yahoo_sym in CRYPTO_SYMBOLS.items():
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_sym}?interval=1d&range=5d"
            r   = SESSION.get(url, timeout=12)
            res = r.json().get("chart", {}).get("result", [])
            if res:
                closes = res[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
                stamps = res[0].get("timestamp", [])
                for i in range(len(closes) - 1, -1, -1):
                    if closes[i] is not None:
                        gbp  = round(closes[i], 6) if closes[i] < 10 else round(closes[i], 2)
                        date = datetime.datetime.utcfromtimestamp(stamps[i]).date().isoformat()
                        valid_prev = [c for c in closes[:i] if c is not None]
                        prev = (round(valid_prev[-1], 6) if valid_prev[-1] < 10 else round(valid_prev[-1], 2)) if valid_prev else None
                        crypto_fetched[sym_id] = (gbp, date, prev)
                        print(f"  {sym_id:6} {yahoo_sym:12}  £{gbp:>14,.4f}  ({date})")
                        break
        except Exception as e:
            print(f"  {sym_id} error: {e}")

    if crypto_fetched and "crypto" in d and d["crypto"]:
        for coin in d["crypto"]:
            cid = coin["id"].upper()   # btc → BTC
            if cid in crypto_fetched:
                gbp, pdate, prev = crypto_fetched[cid]
                coin["prevPrice"] = coin.get("price")   # roll current → prev
                coin["price"]     = gbp
                coin["priceDate"] = pdate
                if prev is not None and coin["prevPrice"] is None:
                    coin["prevPrice"] = prev
        total_crypto = sum(
            c.get("units", 0) * c["price"]
            for c in d["crypto"]
            if c.get("units") and c.get("price")
        )
        if "cryptoHistory" not in d:
            d["cryptoHistory"] = []
        existing_ch = [e for e in d["cryptoHistory"] if e["date"] == TODAY]
        crypto_entry = {"date": TODAY, "totalValue": round(total_crypto, 2)}
        if existing_ch:
            existing_ch[0].update(crypto_entry)
        else:
            d["cryptoHistory"].append(crypto_entry)
        print(f"  Crypto portfolio total: £{total_crypto:,.2f}")

    total_value = sum(hval(h) for acc in d["accounts"] for h in acc["holdings"])

    d["meta"]["prevDate"]         = d["meta"]["fetchDate"]
    d["meta"]["prevDateDisplay"]  = d["meta"]["fetchDateDisplay"]
    d["meta"]["fetchDate"]        = TODAY
    d["meta"]["fetchDateDisplay"] = TODAY_DISPLAY

    failed = [t for t in YAHOO_SYMBOLS if t not in fetched]
    notes  = f"Auto-fetch {TODAY}."
    if failed:           notes += f" Not updated: {', '.join(failed)}."
    if pension_value:    notes += f" Pension £{float(pension_value):,.0f}."

    entry = {"date": TODAY, "totalValue": round(total_value), "prices": prices_snapshot, "notes": notes}
    existing = [e for e in d["history"] if e["date"] == TODAY]
    if existing:
        existing[0].update(entry)
    else:
        d["history"].append(entry)

    with open(JSON_PATH, "w") as f:
        json.dump(d, f, indent=2)

    print(f"\n{'─'*60}")
    print(f"  {'✓':3} {updated} holdings updated   Total: £{total_value:,.0f}")
    print(f"  {'✓':3} History: {len(d['history'])} entries  (latest: {TODAY})")
    if failed:
        print(f"  {'⚠':3} Not fetched: {', '.join(failed)}")
    print(f"  {'✓':3} Saved → {JSON_PATH.name}")
    print(f"{'─'*60}\n")


if __name__ == "__main__":
    main(pension_value=float(sys.argv[1]) if len(sys.argv) > 1 else None)
