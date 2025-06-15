# For Basic Auth
curl -v -u username:password http://localhost:3001/api/v1/health

# For token-based auth (replace YOUR_TOKEN with the actual token)
curl -v -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/v1/health