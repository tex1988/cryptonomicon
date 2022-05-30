const API_KEY = "3a20abbc7379ef2d63c3a3f3b78efd53a44870ee29e751b9093726e35f919ecc";
const AGGREGATE_INDEX = "5";
const tickersHandlers = new Map();
const websocket = new WebSocket(`wss://streamer.cryptocompare.com/v2/?api_key=${API_KEY}`)

websocket.addEventListener("message", e => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);
    if (type === AGGREGATE_INDEX && newPrice !== undefined) {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(handler => handler(newPrice))
    }
})

function sendMessageToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message);
    if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(stringifiedMessage);
    } else {
        websocket.addEventListener("open", () => {
                websocket.send(stringifiedMessage);
            },
            {once: true});
    }
}

function subscribeToTickerOnWebSocket(tickerName) {
    const message = {
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${tickerName}~USD`]
    };
    sendMessageToWebSocket(message);
}

function unsubscribeTickerFromWebSocket(tickerName) {
    const message = {
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${tickerName}~USD`]
    };
    sendMessageToWebSocket(message);
}

export function subscribeToTicker(tickerName, callback) {
    const subscribers = tickersHandlers.get(tickerName) || [];
    tickersHandlers.set(tickerName, [...subscribers, callback]);
    subscribeToTickerOnWebSocket(tickerName);
}

export function unsubscribeFromTicker(tickerName) {
    tickersHandlers.delete(tickerName)
    unsubscribeTickerFromWebSocket(tickerName)
}

export async function fetchCoins() {
    const data = await fetch(
        `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
    );
    return Object.values((await data.json()).Data);
}