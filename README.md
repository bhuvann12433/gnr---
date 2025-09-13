# Gnr Surgicals - Inventory Management System

A complete full-stack inventory management system designed for Gnr Surgicals, featuring surgical and houseware equipment tracking with advanced status management and detailed analytics.

## 🏥 Features

### Backend (Node.js + Express + MongoDB)
- **Equipment Management**: Full CRUD operations for surgical equipment
- **Advanced Data Model**: Equipment with SKU, categories, quantity tracking, cost management, and status distribution
- **Status Tracking**: Real-time tracking of available, in-use, and maintenance status counts
- **Analytics API**: Comprehensive statistics and category-specific insights
- **Data Validation**: Robust validation ensuring data integrity and status count accuracy

### Frontend (React + Tailwind CSS)
- **Professional Dashboard**: Real-time overview of inventory statistics and status distribution
- **Smart Equipment Table**: Advanced table with inline status management and quick actions
- **Category Management**: Sidebar navigation with category-based filtering and cost breakdowns
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Equipment Forms**: Comprehensive forms for adding/editing equipment with validation

### Key Capabilities
- **Multi-Status Tracking**: Track equipment as available, in-use, or under maintenance
- **Cost Analytics**: Total value calculations and category-wise cost analysis
- **Search & Filter**: Advanced filtering by category, status, and text search
- **Real-time Updates**: Instant status updates with visual feedback
- **Data Validation**: Ensures status counts always match total quantities

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up MongoDB**:
   - Install MongoDB locally OR use MongoDB Atlas (cloud)
   - Update the `MONGODB_URI` in `.env` file
   - Default: `mongodb://localhost:27017/gnr_surgicals`

4. **Seed the database with sample data**:
   ```bash
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

   The API will be available at: `http://localhost:5000`

### Frontend Setup

1. **Install dependencies** (from root directory):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:5173`

## 📊 Sample Data

The seed script includes realistic medical equipment data:
- **Instruments**: Surgical Scissors, Forceps, Suture Kits
- **Consumables**: Disposable Gloves, Surgical Masks, Gauze Pads
- **Diagnostic**: Pulse Oximeter, Blood Pressure Monitor, Thermometer
- **Furniture**: Patient Examination Beds, IV Stands
- **Electronics**: ECG Machine with advanced features

## 🔌 API Endpoints

### Equipment Management
- `GET /api/equipment` - List all equipment (supports filtering)
- `POST /api/equipment` - Create new equipment
- `GET /api/equipment/:id` - Get specific equipment
- `PUT /api/equipment/:id` - Update equipment
- `PATCH /api/equipment/:id/status` - Update status counts
- `DELETE /api/equipment/:id` - Delete equipment

### Analytics & Statistics
- `GET /api/stats/summary` - Overall inventory statistics
- `GET /api/stats/category/:name` - Detailed category analysis

### Filtering Parameters
- `category`: Filter by equipment category
- `search`: Text search across name, SKU, and location
- `status`: Filter by equipment status (available/in_use/maintenance)

## 🏗️ Technical Architecture

### Backend Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework with middleware
- **MongoDB**: Document database with Mongoose ODM
- **Data Validation**: Comprehensive validation with error handling

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with comprehensive interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, consistent icons

### Key Design Patterns
- **Component-based Architecture**: Reusable, maintainable components
- **RESTful API**: Standard HTTP methods with proper status codes
- **Responsive Design**: Mobile-first approach with breakpoints
- **Error Handling**: Comprehensive error handling and user feedback

## 🔒 Production Considerations

### Security
- Input validation and sanitization
- Error handling without information disclosure
- CORS configuration for cross-origin requests

### Performance
- Efficient database queries with indexing
- Optimized component rendering
- Lazy loading and code splitting ready

### Scalability
- Modular architecture for easy extension
- Database schema designed for growth
- Component structure supports feature additions

## 📱 Mobile Responsiveness

- **Responsive Dashboard**: Cards stack appropriately on mobile
- **Mobile Navigation**: Collapsible sidebar with overlay
- **Touch-Friendly**: Optimized touch targets and gestures
- **Mobile Tables**: Horizontal scrolling for data tables
- **Adaptive Layout**: Breakpoints at 768px and 1024px

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) for main actions and branding
- **Secondary**: Teal (#14B8A6) for secondary actions
- **Success**: Green (#10B981) for positive states
- **Warning**: Orange (#F59E0B) for caution states
- **Error**: Red (#EF4444) for error states
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headers**: Font weights 600-700 with proper line height
- **Body**: 400 weight with 150% line height for readability
- **UI Text**: 500 weight for labels and interface elements

This system provides a solid foundation for medical equipment inventory management with room for future enhancements and scalability.