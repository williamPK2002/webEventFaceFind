# Prometheus & Grafana Monitoring Setup

## 🎯 What You Get

**Prometheus** (Port 9090): Collects metrics from all services
**Grafana** (Port 3001): Beautiful dashboards to visualize everything

## 🚀 Quick Start

### 1. Start the Monitoring Stack

```bash
cd /Users/saisengmain/Desktop/hello/api
docker-compose up -d prometheus grafana
```

### 2. Rebuild AI Service (to include new metrics library)

```bash
docker-compose build ai-service
docker-compose up -d ai-service
```

### 3. Restart NestJS API (to enable metrics endpoint)

```bash
# In a separate terminal
cd /Users/saisengmain/Desktop/hello/api
npm run start:dev
```

## 📊 Access Your Dashboards

### Grafana Dashboard
- **URL**: http://localhost:3001
- **Username**: `admin`
- **Password**: `admin`
- **Pre-loaded Dashboard**: "PhotoFinder System Overview"

### Prometheus (Raw Metrics)
- **URL**: http://localhost:9090
- Try queries like: `http_requests_total`, `photo_uploads_total`, `face_search_total`

### API Metrics Endpoint
- **URL**: http://localhost:3000/metrics
- See raw Prometheus metrics from your NestJS API

### AI Service Metrics
- **URL**: http://localhost:8000/metrics
- See metrics from your FastAPI AI service

## 📈 What You Can Monitor

### System Health
- **CPU Usage**: See if services are overloaded
- **Memory Usage**: Track RAM consumption (AI models use a lot!)
- **Request Rate**: HTTP requests per second

### Business Metrics
- **Photo Uploads**: Total photos uploaded over time
- **Face Searches**: How many searches users perform
- **AI Processing Time**: How long face detection takes

### Performance
- **HTTP Request Duration**: API response times
- **95th Percentile Latency**: Worst-case performance
- **Error Rates**: Failed requests

## 🔧 Customizing Dashboards

1. Go to Grafana (http://localhost:3001)
2. Click "Dashboards" → "PhotoFinder System Overview"
3. Click the gear icon (⚙️) → "Settings"
4. Add new panels with custom queries

### Example Queries

**Average photo upload time:**
```promql
rate(ai_processing_duration_seconds_sum[5m]) / rate(ai_processing_duration_seconds_count[5m])
```

**Failed uploads:**
```promql
sum(photo_uploads_total{status="failed"})
```

**Requests by endpoint:**
```promql
sum by (route) (rate(http_requests_total[5m]))
```

## 🚨 Setting Up Alerts (Optional)

You can configure Grafana to send alerts when:
- AI service is down
- Memory usage > 90%
- Error rate spikes
- Upload processing time > 5 seconds

## 🛠️ Troubleshooting

### Prometheus shows "Down" for a service
- Check if the service is running: `docker ps`
- Check if metrics endpoint works: `curl http://localhost:3000/metrics`

### Grafana shows "No Data"
- Wait 15-30 seconds for Prometheus to scrape metrics
- Check Prometheus targets: http://localhost:9090/targets

### Can't access Grafana
- Ensure port 3001 is not in use: `lsof -i :3001`
- Check container logs: `docker logs face_search_grafana`

## 📝 Next Steps

1. **Start using the system** - Upload photos, search faces
2. **Watch metrics in real-time** - Open Grafana and see the numbers change
3. **Create custom dashboards** - Add panels for specific metrics you care about
4. **Set up alerts** - Get notified when something goes wrong

Enjoy your monitoring! 🎉
