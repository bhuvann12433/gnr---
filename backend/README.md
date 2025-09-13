# Gnr Surgicals - Backend API

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup MongoDB**
   - Install MongoDB locally OR use MongoDB Atlas (cloud)
   - Update the MONGODB_URI in `.env` file

3. **Seed the Database**
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The API will be available at: http://localhost:5000

## API Endpoints

### Equipment Routes
- `GET /api/equipment` - Get all equipment (supports query params: category, search, status)
- `GET /api/equipment/:id` - Get single equipment item
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment
- `PATCH /api/equipment/:id/status` - Update equipment status counts
- `DELETE /api/equipment/:id` - Delete equipment

### Stats Routes
- `GET /api/stats/summary` - Get overall statistics
- `GET /api/stats/category/:name` - Get detailed category statistics

### Health Check
- `GET /api/health` - API health status

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/gnr_surgicals
PORT=5000
```

## Sample Data

The seed script includes sample medical equipment:
- Surgical Scissors
- Disposable Gloves
- Pulse Oximeter
- Blood Pressure Monitor
- Patient Examination Bed
- ECG Machine
- And more...

## Production Deployment

1. Set production MongoDB URI
2. Set NODE_ENV=production
3. Use PM2 or similar for process management
4. Setup reverse proxy (nginx)
5. Enable HTTPS