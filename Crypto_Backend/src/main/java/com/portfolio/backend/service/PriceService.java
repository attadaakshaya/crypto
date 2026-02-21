package com.portfolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PriceService {

    private static final String COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
    private static final String BINANCE_TICKER_URL = "https://api.binance.com/api/v3/ticker/price";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Cache to prevent hitting rate limits too hard
    private Map<String, Double> priceCache = new HashMap<>();
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 30000; // 30 seconds

    private HttpEntity<String> getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        return new HttpEntity<>(headers);
    }

    // --- CoinGecko Market Data ---

    public List<Map<String, Object>> getTopCoins() {
        String url = COINGECKO_API_URL + "/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=50&page=1&sparkline=true";
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getHeaders(), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
            List<Map<String, Object>> coins = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    Map<String, Object> coin = new HashMap<>();
                    coin.put("id", node.get("id").asText());
                    coin.put("symbol", node.get("symbol").asText().toUpperCase());
                    coin.put("name", node.get("name").asText());
                    coin.put("current_price", node.get("current_price").asDouble());
                    coin.put("market_cap", node.get("market_cap").asLong());
                    coin.put("price_change_percentage_24h", node.get("price_change_percentage_24h").asDouble());
                    coin.put("image", node.get("image").asText());
                    
                    // Sparkline (7 days)
                    JsonNode sparkline = node.get("sparkline_in_7d").get("price");
                    List<Double> prices = new ArrayList<>();
                    if (sparkline != null && sparkline.isArray()) {
                         for (JsonNode p : sparkline) {
                            prices.add(p.asDouble());
                        }
                    } else {
                         // Fallback sparkline if missing
                         for(int i=0; i<168; i++) prices.add(node.get("current_price").asDouble());
                    }
                    coin.put("sparkline", prices);
                    
                    coins.add(coin);
                }
            }
            if (coins.isEmpty()) return getMockCoins(); // Use mock if empty response
            return coins;
        } catch (Exception e) {
            System.err.println("CoinGecko Error: " + e.getMessage());
            return getMockCoins(); // Use mock on error
        }
    }

    private List<Map<String, Object>> getMockCoins() {
        List<Map<String, Object>> mocks = new ArrayList<>();
        String[] ids = {"bitcoin", "ethereum", "solana", "binancecoin", "ripple"};
        String[] symbols = {"BTC", "ETH", "SOL", "BNB", "XRP"};
        String[] names = {"Bitcoin", "Ethereum", "Solana", "BNB", "XRP"};
        double[] prices = {8500000.0, 320000.0, 12000.0, 55000.0, 200.0};
        
        for (int i = 0; i < ids.length; i++) {
            Map<String, Object> coin = new HashMap<>();
            coin.put("id", ids[i]);
            coin.put("symbol", symbols[i]);
            coin.put("name", names[i]);
            coin.put("current_price", prices[i]);
            coin.put("market_cap", prices[i] * 1000000);
            coin.put("price_change_percentage_24h", (Math.random() * 10) - 5);
            coin.put("image", "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"); // Generic fallback or specific if possible
            
            List<Double> sparkline = new ArrayList<>();
            for(int j=0; j<50; j++) sparkline.add(prices[i] * (1 + (Math.random() * 0.1 - 0.05)));
            coin.put("sparkline", sparkline);
            
            mocks.add(coin);
        }
        return mocks;
    }

    // --- Chart Caching ---
    private Map<String, CacheEntry> chartCache = new HashMap<>();

    private static class CacheEntry {
        long timestamp;
        List<List<Number>> data;

        CacheEntry(long timestamp, List<List<Number>> data) {
            this.timestamp = timestamp;
            this.data = data;
        }
    }

    private List<List<Number>> getCachedData(String key, long ttl) {
        if (chartCache.containsKey(key)) {
            CacheEntry entry = chartCache.get(key);
            if (System.currentTimeMillis() - entry.timestamp < ttl) {
                return entry.data;
            }
        }
        return null;
    }

    public List<List<Number>> getMarketChart(String id, String days) {
        String validDays = days != null ? days : "7";
        String cacheKey = "chart_" + id + "_" + validDays;
        long ttl = validDays.equals("1") ? 300000 : 3600000; // 5 mins for 1D, 1 hour for others

        List<List<Number>> cached = getCachedData(cacheKey, ttl);
        if (cached != null) return cached;

        String url = COINGECKO_API_URL + "/coins/" + id + "/market_chart?vs_currency=inr&days=" + validDays;
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getHeaders(), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode prices = root.get("prices");
            
            List<List<Number>> chartData = new ArrayList<>();
            if (prices.isArray()) {
                for (JsonNode point : prices) {
                    // [timestamp, price]
                    List<Number> p = new ArrayList<>();
                    p.add(point.get(0).asLong());
                    p.add(point.get(1).asDouble());
                    chartData.add(p);
                }
            }
            if (!chartData.isEmpty()) {
                chartCache.put(cacheKey, new CacheEntry(System.currentTimeMillis(), chartData));
            }
            return chartData;
        } catch (Exception e) {
             System.err.println("CoinGecko Chart Error: " + e.getMessage());
             return new ArrayList<>();
        }
    }

    public List<List<Number>> getMarketOhlc(String id, String days) {
        String validDays = days != null ? days : "7";
        String cacheKey = "ohlc_" + id + "_" + validDays;
        long ttl = validDays.equals("1") ? 300000 : 3600000; 

        List<List<Number>> cached = getCachedData(cacheKey, ttl);
        if (cached != null) return cached;

        // CoinGecko endpoint: /coins/{id}/ohlc?vs_currency=inr&days={days}
        String url = COINGECKO_API_URL + "/coins/" + id + "/ohlc?vs_currency=inr&days=" + validDays;
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, getHeaders(), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
            List<List<Number>> ohlcData = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode point : root) {
                    // [timestamp, open, high, low, close]
                    List<Number> p = new ArrayList<>();
                    p.add(point.get(0).asLong());
                    p.add(point.get(1).asDouble()); // Open
                    p.add(point.get(2).asDouble()); // High
                    p.add(point.get(3).asDouble()); // Low
                    p.add(point.get(4).asDouble()); // Close
                    ohlcData.add(p);
                }
            }
            if (!ohlcData.isEmpty()) {
                chartCache.put(cacheKey, new CacheEntry(System.currentTimeMillis(), ohlcData));
            }
            return ohlcData;
        } catch (Exception e) {
             System.err.println("CoinGecko OHLC Error: " + e.getMessage());
             return new ArrayList<>();
        }
    }

    // --- Binance Portfolio Pricing (Fallback/Core) ---

    public Map<String, Double> getPrices(String symbols) {
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastFetchTime < CACHE_DURATION && !priceCache.isEmpty()) {
            return priceCache;
        }

        try {
            // Fetch all prices from Binance
            String url = BINANCE_TICKER_URL; 
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            Map<String, Double> newCache = new HashMap<>();
            
            // Approximate USDT to INR rate (since most Binance pairs are USDT)
            // Ideally fetch this dynamically, but for now hardcode or separate fetch
            double usdtInrRate = 87.50; 

            if (root.isArray()) {
                for (JsonNode node : root) {
                    String symbol = node.get("symbol").asText();
                    double price = node.get("price").asDouble();
                    
                    if (symbol.endsWith("USDT")) {
                        String asset = symbol.replace("USDT", "");
                        // Convert USDT price to INR
                        newCache.put(asset, price * usdtInrRate);
                    } else if (symbol.endsWith("BTC")) {
                         // Simplify: Ignore BTC pairs for now or handle complex cross-rates
                    }
                    newCache.put("USDT", usdtInrRate); // Base USDT price in INR
                }
            }
            
            System.out.println("PriceService: Successfully fetched " + newCache.size() + " prices (INR converted).");
            priceCache = newCache;
            lastFetchTime = currentTime;
            return priceCache;

        } catch (Exception e) {
            System.err.println("PriceService: Failed to fetch prices: " + e.getMessage());
            e.printStackTrace();
            return new HashMap<>(); 
        }
    }
    
    public double getPrice(String asset) {
        if (priceCache.isEmpty()) {
            getPrices(null);
        }
        return priceCache.getOrDefault(asset, 0.0);
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.portfolio.backend.repository.PriceSnapshotRepository priceSnapshotRepository;

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 3600000) // Every 1 hour
    public void savePriceSnapshots() {
        System.out.println("Running Price Snapshot Cron...");
        // Ensure cache is fresh
        getPrices(null);
        
        List<String> trackMsg = new ArrayList<>();
        // Save snapshots for major assets
        String[] assetsToSnapshot = {"BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE"};
        
        for (String asset : assetsToSnapshot) {
            Double price = priceCache.get(asset);
            if (price != null) {
                com.portfolio.backend.entity.PriceSnapshot snapshot = new com.portfolio.backend.entity.PriceSnapshot();
                snapshot.setSymbol(asset);
                snapshot.setPrice(price);
                snapshot.setTimestamp(java.time.LocalDateTime.now());
                priceSnapshotRepository.save(snapshot);
                trackMsg.add(asset);
            }
        }
        System.out.println("Saved Price Snapshots for: " + trackMsg);
    }
}
