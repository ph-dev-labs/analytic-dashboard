# Interactive Data Visualization Dashboard

A modern, responsive React application that provides real-time data visualization and analytics capabilities. Users can upload CSV/Excel files and instantly view dynamic charts, KPIs, and insights.

![Dashboard Preview](https://analytic-dashboards.netlify.app/)

## 🎯 Project Objectives

This project fulfills the following key aims:

1. **Interactive Data Upload**: Users can upload CSV/Excel datasets with immediate processing
2. **Real-time Visualizations**: Dynamic charts that update instantly upon data upload
3. **Modular UI Design**: Responsive interface with tabbed navigation and filtering
4. **Backend Processing**: Automatic data cleaning, parsing, and integration
5. **Performance Analytics**: KPI calculations and trend analysis
6. **Scalable Architecture**: Built for handling larger datasets and multiple users

## ✨ Features

### 📊 Visualization Types
- **Bar Charts**: Revenue by country, age group performance
- **Pie Charts**: Demographic distribution (age groups, gender)
- **Line Charts**: Monthly trends and performance metrics
- **KPI Cards**: Revenue, profit, orders, and average order value

### 🔧 Functionality
- **File Upload**: Support for CSV and Excel files (.csv, .xlsx, .xls)
- **Real-time Filtering**: Dynamic filters by country, age group, and gender
- **Data Processing**: Automatic cleaning, type conversion, and validation
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, tooltips, and clickable components

### 📈 Analytics
- Revenue and profit analysis
- Customer demographic insights
- Geographic performance metrics
- Time-based trend analysis
- Order quantity and value tracking

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interactive-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📦 Dependencies

### Core Libraries
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "recharts": "^2.8.0",
  "papaparse": "^5.4.1",
  "lodash": "^4.17.21",
  "lucide-react": "^0.263.1"
}
```

### Development Dependencies
```json
{
  "tailwindcss": "^3.3.0",
  "@types/papaparse": "^5.3.7"
}
```

## 🏗️ Project Structure

```
interactive-dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── KPICard.jsx           # Reusable KPI card component
│   │   └── ChartComponents/       # Individual chart components
│   ├── utils/
│   │   ├── dataProcessing.js     # Data cleaning and processing
│   │   └── formatters.js         # Number and currency formatters
│   ├── styles/
│   │   └── index.css            # Tailwind CSS imports
│   ├── App.js                   # Root application component
│   └── index.js                 # Application entry point
├── package.json
├── tailwind.config.js
└── README.md
```

## 📊 Data Format

The dashboard supports CSV and Excel files with the following expected columns:

### Required Fields
- `Date`: Transaction date
- `Country`: Customer country
- `Revenue`: Sales revenue (numeric)
- `Profit`: Profit amount (numeric)
- `Customer_Age`: Customer age
- `Customer_Gender`: Gender (M/F)

### Optional Fields
- `Age_Group`: Age group categories
- `State`: Customer state/region
- `Product_Category`: Product categories
- `Order_Quantity`: Number of items ordered
- `Cost`: Cost amount

### Sample Data Format
```csv
Date,Country,Revenue,Profit,Customer_Age,Customer_Gender,Age_Group
12/1/2021,United States,8996,3988,39,F,Adults (35-64)
12/1/2021,Germany,2218,792,36,F,Adults (35-64)
```

## 🎨 Customization

### Theming
The application uses Tailwind CSS for styling. To customize the theme:

1. **Colors**: Modify `tailwind.config.js`
2. **Components**: Edit individual component files
3. **Layout**: Adjust grid and spacing classes

### Adding New Chart Types
```javascript
// Example: Adding a new scatter plot
import { ScatterChart, Scatter } from 'recharts';

const CustomScatter = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart data={data}>
      <XAxis dataKey="x" />
      <YAxis dataKey="y" />
      <Scatter dataKey="value" fill="#8884d8" />
    </ScatterChart>
  </ResponsiveContainer>
);
```


### Performance Optimization
- **Data Memoization**: Uses `useMemo` for expensive calculations
- **Component Optimization**: Implements `useCallback` for event handlers
- **Lazy Loading**: Considers code splitting for larger applications

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)


```

## 🚀 Deployment

### Build for Production
```bash
npm run build
# or
yarn build
```

### Deployment Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your Git repository


### Example Netlify Deployment
```bash
npm run build
npx netlify deploy --prod --dir=build
```

## 🔍 Troubleshooting

### Common Issues

1. **File Upload Not Working**
   - Check file format (CSV/Excel only)
   - Verify file size limits
   - Ensure proper column headers

2. **Charts Not Displaying**
   - Verify data format
   - Check browser console for errors
   - Ensure required fields are present

3. **Performance Issues**
   - Reduce dataset size for testing
   - Check browser memory usage
   - Consider data pagination



**Built with ❤️ using React, Recharts, and Tailwind CSS**