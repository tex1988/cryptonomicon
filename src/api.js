const API_KEY = "3a20abbc7379ef2d63c3a3f3b78efd53a44870ee29e751b9093726e35f919ecc";
const tickersHandlers = new Map();

//TODO: URL search params
export async function fetchTickers() {
    if(tickersHandlers.size !== 0) {
        const f = await fetch(
            `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(",")}&tsyms=USD&api_key=${API_KEY}`
        );
        const updatedPrices =  Object.fromEntries(
            Object.entries(await f.json()).map(([key, value]) => [key, value.USD])
        );
        Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
            const handlers = tickersHandlers.get(currency) ?? [];
            handlers.forEach(handler => handler(newPrice))
        });
    }
}

export function subscribeToTicker(ticker, callback) {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, callback]);
}

export function unsubscribeFromTicker(ticker) {
    tickersHandlers.delete(ticker)
}

export async function fetchCoins() {
    const data = await fetch(
        `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
    );
    return Object.values((await data.json()).Data);
}

setInterval(fetchTickers, 5000);