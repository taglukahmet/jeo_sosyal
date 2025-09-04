# Turkey Social Media Sentiment Analysis Platform

A React-based social media sentiment analysis platform for Turkish provinces, featuring interactive maps, real-time analytics, and comprehensive comparison tools.

## Features

- **Interactive Turkey Map**: Click on provinces to view detailed analytics
- **Real-time Sentiment Analysis**: Live tracking of social media sentiment
- **City Comparison**: Compare up to 3 cities side-by-side
- **National Agenda Tracking**: Monitor nationwide trends and topics
- **Advanced Filtering**: Filter by hashtags, sentiment, and regions
- **Multi-platform Analytics**: Support for X (Twitter), Instagram, and Next Sosyal

## Backend Integration

### API Endpoints Required

The frontend is configured to work with the following backend API structure:

#### Province Data
```
GET /api/provinces                    - Get all provinces with current data
GET /api/provinces/{id}/data          - Get detailed data for specific province
POST /api/provinces/filter            - Filter provinces by criteria
POST /api/provinces/compare           - Get comparative data for multiple provinces
GET /api/provinces/{id}/realtime      - Real-time updates for province
```

#### Social Media Analytics
```
GET /api/social-media/city/{cityName}     - Social media data for specific city
GET /api/social-media/national            - National social media comparison
GET /api/social-media/platform/{platform} - Platform-specific analytics
GET /api/social-media/trending            - Trending topics and hashtags
```

#### National Agenda
```
GET /api/national-agenda                      - National sentiment and trending data
GET /api/national-agenda/weekly-trends        - Weekly national trends
GET /api/national-agenda/regional-performance - Regional performance data
GET /api/national-agenda/insights             - National insights and findings
GET /api/national-agenda/platform-comparison  - National platform comparison
```

#### Filter Options
```
GET /api/filters/options              - Available filter options (hashtags, regions, etc.)
```

### Backend Integration Files

The following files contain backend integration code with axios and React Query:

#### API Service Files
- `src/services/api.ts` - Main axios configuration with interceptors
- `src/services/provinceService.ts` - Province-related API calls
- `src/services/socialMediaService.ts` - Social media analytics API calls  
- `src/services/nationalAgendaService.ts` - National agenda API calls

#### Custom Hooks
- `src/hooks/useBackendData.ts` - React Query hooks for data fetching with caching

#### Component Integration Points
- `src/pages/Index.tsx` - Main dashboard with province data fetching
- `src/components/TurkeyMap.tsx` - Real-time province data updates
- `src/components/CityDetailPanel.tsx` - City analytics and real-time updates
- `src/components/FilterInterface.tsx` - Dynamic filter options from backend
- `src/components/ComparisonView.tsx` - Multi-city comparison data
- `src/components/NationalAgendaPanel.tsx` - National trends and insights
- `src/components/SocialMediaComparison.tsx` - Platform-specific analytics

### Configuration

Update the API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api'  // Your local backend URL
  : 'https://your-backend-domain.com/api';  // Production URL
```

### Real-time Updates

WebSocket connections can be implemented for real-time updates:
- Provincial sentiment changes
- National trending topics
- Live engagement metrics

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Update API endpoints in `src/services/api.ts`
4. Start development server: `npm run dev`
5. Start your backend server on port 3001 (or update the port in api.ts)

## Technologies

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios with React Query for API calls
- **Routing**: React Router DOM
- **State Management**: React hooks with React Query caching

## Project Structure

```
src/
├── components/           # UI components
├── services/            # Backend API services (NEW)
├── hooks/               # Custom React Query hooks (NEW)
├── types/               # TypeScript interfaces
├── frontend_data/       # Mock data (to be replaced by backend)
└── pages/              # Route components
```

## Deployment

The app can be deployed to any static hosting service. For backend integration, ensure:
1. CORS is properly configured on your backend
2. API endpoints match the expected structure
3. Environment variables are set correctly

## Contributing

1. Follow the TODO comments in the codebase for backend integration points
2. All API calls use React Query for caching and error handling
3. Maintain TypeScript interfaces for API responses
4. Test with both mock data and real backend responses