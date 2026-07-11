import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, Zap, Sun, Percent, TrendingUp, Thermometer, Calendar, Filter, BarChart3, AlertTriangle, Leaf, Activity } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

// Smooth number counter animation
function AnimatedNumber({ value, suffix = '', decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    let animationFrameId;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (value - start) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      }
    }

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}

function Dashboard({ dataset, stats, theme }) {
  // Chart filter state
  const [chartMonth, setChartMonth] = useState('all');         // 'all' | '01' | '02' | ... | '06'
  const [chartAggregation, setChartAggregation] = useState('daily'); // 'daily' | 'weekly' | 'hourly'
  const [chartDayType, setChartDayType] = useState('all');     // 'all' | 'weekday' | 'weekend'
  const [chartType, setChartType] = useState('area');          // 'line' | 'bar' | 'area'

  // Auto-adjust aggregation when selecting a single month vs all
  useEffect(() => {
    if (chartMonth === 'all' && chartAggregation === 'hourly') {
      setChartAggregation('daily');
    }
  }, [chartMonth]);

  // Month labels for display
  const MONTH_LABELS = { '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June' };
  
  const [driverSelection, setDriverSelection] = useState('hostels');
  const [driverChartType, setDriverChartType] = useState('bar'); // 'line' | 'bar' | 'area'

  // Datatable state
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('Date');
  const [sortOrder, setSortOrder] = useState('desc'); // default desc to see recent
  const [tableMonth, setTableMonth] = useState('all');
  const [tableDayType, setTableDayType] = useState('all');
  const [tableViewType, setTableViewType] = useState('hourly');
  const [heatmapHover, setHeatmapHover] = useState(null);
  const [tableColumnCategory, setTableColumnCategory] = useState('all');
  
  const heatmapContainerRef = useRef(null);

  const columnsToDisplay = useMemo(() => {
    if (dataset.length === 0) return [];
    const allCols = Object.keys(dataset[0]);
    if (tableColumnCategory === 'all') return allCols;
    
    const alwaysShow = ['Date', 'Day', 'Time'];
    return allCols.filter(col => {
      if (alwaysShow.includes(col)) return true;
      if (tableColumnCategory === 'ab' && col.match(/^AB\d/)) return true;
      if (tableColumnCategory === 'mab' && col.match(/^MAB\d/)) return true;
      if (tableColumnCategory === 'facilities' && (col.includes('Labs') || col.includes('Library') || col.includes('Cafeteria') || col.includes('Auditorium') || col.includes('Hostel') || col.includes('Admin'))) return true;
      if (tableColumnCategory === 'energy' && (col.includes('Solar') || col.includes('Electricity') || col.includes('Temperature') || col.includes('Humidity'))) return true;
      return false;
    });
  }, [dataset, tableColumnCategory]);

  // Filtered Data calculation
  const filteredData = useMemo(() => {
    let filtered = dataset;
    if (tableMonth !== 'all') {
      filtered = filtered.filter(row => row.Date && row.Date.substring(5, 7) === tableMonth);
    }
    if (tableDayType === 'weekday') {
      filtered = filtered.filter(row => !['Saturday', 'Sunday'].includes(row.Day));
    } else if (tableDayType === 'weekend') {
      filtered = filtered.filter(row => ['Saturday', 'Sunday'].includes(row.Day));
    }

    if (tableViewType === 'daily') {
      const dailyMap = {};
      const countMap = {};
      
      filtered.forEach(row => {
        if (!dailyMap[row.Date]) {
          dailyMap[row.Date] = { ...row, Time: 'All Day' };
          countMap[row.Date] = 1;
        } else {
          countMap[row.Date]++;
          Object.keys(row).forEach(key => {
            if (typeof row[key] === 'number') {
              dailyMap[row.Date][key] += row[key];
            }
          });
        }
      });
      
      // Average out Temperature and Humidity
      Object.keys(dailyMap).forEach(date => {
        const count = countMap[date];
        if (count > 0) {
          if (dailyMap[date]['Temperature_C'] !== undefined) {
            dailyMap[date]['Temperature_C'] = dailyMap[date]['Temperature_C'] / count;
          }
          if (dailyMap[date]['Humidity_%'] !== undefined) {
            dailyMap[date]['Humidity_%'] = dailyMap[date]['Humidity_%'] / count;
          }
        }
      });
      
      filtered = Object.values(dailyMap);
    }

    if (!search.trim()) return filtered;
    const s = search.toLowerCase();
    return filtered.filter(row => {
      // Check all values in the row for search match
      return Object.values(row).some(val => 
        val !== null && val.toString().toLowerCase().includes(s)
      );
    });
  }, [dataset, search, tableMonth, tableDayType, tableViewType]);

  // Sorted Data calculation
  const sortedData = useMemo(() => {
    const data = [...filteredData];
    data.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });
    return data;
  }, [filteredData, sortColumn, sortOrder]);

  // Paginated Data calculation
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = Object.keys(sortedData[0]);
    const csvRows = [headers.join(',')];
    sortedData.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        return typeof val === 'string' ? `"${val}"` : val;
      });
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_campus_energy_data_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get current styles for Chart customization
  const chartStyles = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      text: isDark ? '#9ca3af' : '#64748b',
      grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      indigo: isDark ? '#6366f1' : '#4f46e5',
      cyan: isDark ? '#06b6d4' : '#0891b2',
      emerald: isDark ? '#10b981' : '#059669',
      rose: isDark ? '#f43f5e' : '#e11d48',
      violet: isDark ? '#8b5cf6' : '#7c3aed',
    };
  }, [theme]);

  // Main Chart configuration — with multi-level filtering
  const mainChartData = useMemo(() => {
    // Step 1: Filter by month
    let filtered = dataset;
    if (chartMonth !== 'all') {
      filtered = dataset.filter(row => row.Date && row.Date.substring(5, 7) === chartMonth);
    }

    // Step 2: Filter by day type
    if (chartDayType === 'weekday') {
      filtered = filtered.filter(row => !['Saturday', 'Sunday'].includes(row.Day));
    } else if (chartDayType === 'weekend') {
      filtered = filtered.filter(row => ['Saturday', 'Sunday'].includes(row.Day));
    }

    let labels = [];
    let electricityData = [];
    let solarData = [];
    let tempData = [];

    // Step 3: Aggregate based on selected level
    if (chartAggregation === 'hourly') {
      // Hourly average (mean per hour across filtered days)
      const hourlyMap = Array.from({ length: 24 }, () => ({ sumElec: 0, sumSolar: 0, sumTemp: 0, count: 0 }));
      filtered.forEach(row => {
        const hour = parseInt(row.Time.split(':')[0]);
        hourlyMap[hour].sumElec += row.Electricity_Consumption_kWh;
        hourlyMap[hour].sumSolar += row.Solar_Generation_kWh;
        hourlyMap[hour].sumTemp += row.Temperature_C;
        hourlyMap[hour].count += 1;
      });
      labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      electricityData = hourlyMap.map(h => h.count > 0 ? h.sumElec / h.count : 0);
      solarData = hourlyMap.map(h => h.count > 0 ? h.sumSolar / h.count : 0);
      tempData = hourlyMap.map(h => h.count > 0 ? h.sumTemp / h.count : 0);

    } else if (chartAggregation === 'weekly') {
      // Weekly average — group by week-of-month (days 1-7 = W1, 8-14 = W2, etc.)
      const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const weeklyMap = {};
      filtered.forEach(row => {
        const d = new Date(row.Date);
        const monthIdx = d.getMonth(); // 0-based
        const dayOfMonth = d.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7); // 1-4 (or 5 for 29-31)
        const key = chartMonth !== 'all' 
          ? `Week ${weekOfMonth}` 
          : `${monthAbbr[monthIdx]} W${weekOfMonth}`;
        if (!weeklyMap[key]) weeklyMap[key] = { sumElec: 0, sumSolar: 0, sumTemp: 0, count: 0, sortKey: monthIdx * 10 + weekOfMonth };
        weeklyMap[key].sumElec += row.Electricity_Consumption_kWh;
        weeklyMap[key].sumSolar += row.Solar_Generation_kWh;
        weeklyMap[key].sumTemp += row.Temperature_C;
        weeklyMap[key].count += 1;
      });
      const sortedKeys = Object.keys(weeklyMap).sort((a, b) => weeklyMap[a].sortKey - weeklyMap[b].sortKey);
      labels = sortedKeys;
      electricityData = sortedKeys.map(k => weeklyMap[k].sumElec / weeklyMap[k].count);
      solarData = sortedKeys.map(k => weeklyMap[k].sumSolar / weeklyMap[k].count);
      tempData = sortedKeys.map(k => weeklyMap[k].sumTemp / weeklyMap[k].count);

    } else {
      // Daily average (default)
      const dailyMap = {};
      filtered.forEach(row => {
        if (!dailyMap[row.Date]) dailyMap[row.Date] = { sumElec: 0, sumSolar: 0, sumTemp: 0, count: 0 };
        dailyMap[row.Date].sumElec += row.Electricity_Consumption_kWh;
        dailyMap[row.Date].sumSolar += row.Solar_Generation_kWh;
        dailyMap[row.Date].sumTemp += row.Temperature_C;
        dailyMap[row.Date].count += 1;
      });
      const sortedDates = Object.keys(dailyMap).sort();
      // Smart label formatting: show full date for single month, abbreviated for all
      labels = sortedDates.map(d => chartMonth !== 'all' ? d.substring(8) : d.substring(5));
      electricityData = sortedDates.map(d => dailyMap[d].sumElec / dailyMap[d].count);
      solarData = sortedDates.map(d => dailyMap[d].sumSolar / dailyMap[d].count);
      tempData = sortedDates.map(d => dailyMap[d].sumTemp / dailyMap[d].count);
    }

    const buildGradient = (context, baseColor) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      if (!chartArea) return null;
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, baseColor + '50');
      gradient.addColorStop(1, baseColor + '00');
      return gradient;
    };

    return {
      labels,
      datasets: [
        {
          label: 'Electricity (kWh)',
          data: electricityData,
          borderColor: chartStyles.indigo,
          borderWidth: chartType === 'bar' ? 1 : 3,
          backgroundColor: chartType === 'bar' ? chartStyles.indigo + 'cc' : (chartType === 'area' ? (ctx) => buildGradient(ctx, chartStyles.indigo) : 'transparent'),
          fill: chartType === 'area',
          tension: 0.35,
          yAxisID: 'y',
          pointHoverRadius: 7,
          borderRadius: chartType === 'bar' ? 4 : 0,
          pointRadius: chartType === 'bar' ? 0 : (labels.length > 60 ? 0 : 2)
        },
        {
          label: 'Solar (kWh)',
          data: solarData,
          borderColor: chartStyles.emerald,
          borderWidth: chartType === 'bar' ? 1 : 3,
          backgroundColor: chartType === 'bar' ? chartStyles.emerald + 'cc' : (chartType === 'area' ? (ctx) => buildGradient(ctx, chartStyles.emerald) : 'transparent'),
          fill: chartType === 'area',
          tension: 0.35,
          yAxisID: 'y',
          pointHoverRadius: 7,
          borderRadius: chartType === 'bar' ? 4 : 0,
          pointRadius: chartType === 'bar' ? 0 : (labels.length > 60 ? 0 : 2)
        },
        {
          label: 'Temp (°C)',
          data: tempData,
          borderColor: chartStyles.rose,
          borderWidth: 2.5,
          borderDash: chartType === 'bar' ? [] : [5, 5],
          backgroundColor: chartType === 'bar' ? chartStyles.rose + '80' : chartStyles.rose + '20',
          fill: false,
          tension: 0.35,
          yAxisID: 'y1',
          pointHoverRadius: 6,
          borderRadius: chartType === 'bar' ? 4 : 0,
          pointRadius: 0
        }
      ]
    };
  }, [dataset, chartMonth, chartAggregation, chartDayType, chartType, chartStyles]);

  // Dynamic chart title
  const mainChartTitle = useMemo(() => {
    const monthLabel = chartMonth === 'all' ? 'All Months' : MONTH_LABELS[chartMonth];
    const aggLabel = { daily: 'Daily', weekly: 'Weekly', hourly: 'Hourly Mean' }[chartAggregation];
    const dayLabel = chartDayType === 'all' ? '' : chartDayType === 'weekday' ? ' · Weekdays' : ' · Weekends';
    return `${monthLabel} — ${aggLabel} Profile${dayLabel}`;
  }, [chartMonth, chartAggregation, chartDayType, MONTH_LABELS]);

  const mainChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { bottom: 20 } },
    plugins: {
      legend: { 
        labels: { 
          color: chartStyles.text, 
          font: { family: 'Plus Jakarta Sans', weight: 500 },
          boxWidth: 12,
          usePointStyle: true
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { family: 'Outfit', size: 13 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        borderColor: chartStyles.indigo + '40',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: { 
        grid: { color: chartStyles.grid }, 
        ticks: { color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 11 } } 
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: chartStyles.grid },
        ticks: { color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 11 } },
        title: { display: true, text: 'Energy (kWh)', color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 } }
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 11 } },
        title: { display: true, text: 'Temperature (°C)', color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 } }
      }
    }
  };

  // Base filtered dataset for all secondary charts (Drivers, Zone, Heatmap)
  const globalFilteredDataset = useMemo(() => {
    let filtered = dataset;
    if (chartMonth !== 'all') {
      filtered = filtered.filter(row => row.Date && row.Date.substring(5, 7) === chartMonth);
    }
    if (chartDayType === 'weekday') {
      filtered = filtered.filter(row => !['Saturday', 'Sunday'].includes(row.Day));
    } else if (chartDayType === 'weekend') {
      filtered = filtered.filter(row => ['Saturday', 'Sunday'].includes(row.Day));
    }
    return filtered;
  }, [dataset, chartMonth, chartDayType]);

  // Driver Chart configuration — synced with main chart filters
  const driverChartData = useMemo(() => {
    const filtered = globalFilteredDataset;

    const buildGradient = (context, baseColor) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      if (!chartArea) return null;
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, baseColor + '50');
      gradient.addColorStop(1, baseColor + '00');
      return gradient;
    };

    const makeDataset = (label, data, color, yAxisID = 'y') => {
      return {
        label,
        data,
        borderColor: color,
        borderWidth: driverChartType === 'bar' ? 1 : 2.5,
        backgroundColor: driverChartType === 'bar' 
          ? color + 'cc' 
          : (driverChartType === 'area' ? (ctx) => buildGradient(ctx, color) : 'transparent'),
        fill: driverChartType === 'area',
        tension: 0.35,
        borderRadius: driverChartType === 'bar' ? 4 : 0,
        pointRadius: driverChartType === 'bar' ? 0 : 2,
        yAxisID
      };
    };

    if (driverSelection === 'hostels') {
      const hostelData = {};
      filtered.forEach(row => {
        if (!hostelData[row.Day]) {
          hostelData[row.Day] = { sumBoys: 0, sumGirls: 0, count: 0 };
        }
        hostelData[row.Day].sumBoys += row.Boys_Hostel_Load_kWh;
        hostelData[row.Day].sumGirls += row.Girls_Hostel_Load_kWh;
        hostelData[row.Day].count += 1;
      });

      const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const labels = daysOrder.filter(d => hostelData[d]);
      const boysLoads = labels.map(d => hostelData[d].sumBoys / hostelData[d].count);
      const girlsLoads = labels.map(d => hostelData[d].sumGirls / hostelData[d].count);

      return {
        labels,
        datasets: [
          makeDataset('Boys Hostel', boysLoads, chartStyles.cyan),
          makeDataset('Girls Hostel', girlsLoads, chartStyles.rose)
        ]
      };
    } else if (driverSelection === 'academic') {
      const hourlyAB = Array.from({ length: 24 }, () => ({ ab1: 0, ab2: 0, ab3: 0, ab4: 0, ab5: 0, count: 0 }));
      filtered.forEach(row => {
        const hour = parseInt(row.Time.split(':')[0]);
        hourlyAB[hour].ab1 += row.AB1_Students;
        hourlyAB[hour].ab2 += row.AB2_Students;
        hourlyAB[hour].ab3 += row.AB3_Students;
        hourlyAB[hour].ab4 += row.AB4_Students;
        hourlyAB[hour].ab5 += row.AB5_Students;
        hourlyAB[hour].count += 1;
      });
      const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      return {
        labels,
        datasets: [
          makeDataset('AB1 Block', hourlyAB.map(h => h.ab1 / h.count), chartStyles.indigo),
          makeDataset('AB2 Block', hourlyAB.map(h => h.ab2 / h.count), chartStyles.cyan),
          makeDataset('AB3 Block', hourlyAB.map(h => h.ab3 / h.count), chartStyles.emerald),
          makeDataset('AB4 Block', hourlyAB.map(h => h.ab4 / h.count), '#f59e0b'),
          makeDataset('AB5 Block', hourlyAB.map(h => h.ab5 / h.count), chartStyles.rose)
        ]
      };
    } else if (driverSelection === 'mblocks') {
      const hourlyMAB = Array.from({ length: 24 }, () => ({ mab1: 0, mab2: 0, mab3: 0, mab4: 0, count: 0 }));
      filtered.forEach(row => {
        const hour = parseInt(row.Time.split(':')[0]);
        hourlyMAB[hour].mab1 += row.MAB1_Students;
        hourlyMAB[hour].mab2 += row.MAB2_Students;
        hourlyMAB[hour].mab3 += row.MAB3_Students;
        hourlyMAB[hour].mab4 += row.MAB4_Students;
        hourlyMAB[hour].count += 1;
      });
      const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      return {
        labels,
        datasets: [
          makeDataset('MAB1 Block', hourlyMAB.map(h => h.mab1 / h.count), chartStyles.indigo),
          makeDataset('MAB2 Block', hourlyMAB.map(h => h.mab2 / h.count), chartStyles.cyan),
          makeDataset('MAB3 Block', hourlyMAB.map(h => h.mab3 / h.count), chartStyles.emerald),
          makeDataset('MAB4 Block', hourlyMAB.map(h => h.mab4 / h.count), chartStyles.rose)
        ]
      };
    } else if (driverSelection === 'labs') {
      const hourlyLabs = Array.from({ length: 24 }, () => ({ win: 0, mac: 0, lib: 0, count: 0 }));
      filtered.forEach(row => {
        const hour = parseInt(row.Time.split(':')[0]);
        hourlyLabs[hour].win += row.Active_Windows_Labs;
        hourlyLabs[hour].mac += row.Active_Mac_Labs;
        hourlyLabs[hour].lib += row.Central_Library_Occupancy;
        hourlyLabs[hour].count += 1;
      });
      const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      return {
        labels,
        datasets: [
          makeDataset('Windows Labs (Active)', hourlyLabs.map(h => h.win / h.count), chartStyles.cyan, 'y'),
          makeDataset('Mac Labs (Active)', hourlyLabs.map(h => h.mac / h.count), chartStyles.rose, 'y'),
          makeDataset('Library Occupancy', hourlyLabs.map(h => h.lib / h.count), chartStyles.indigo, 'y1')
        ]
      };
    } else if (driverSelection === 'cafeteria') {
      const hourlyCafe = Array.from({ length: 24 }, () => ({ glass: 0, open: 0, count: 0 }));
      filtered.forEach(row => {
        const hour = parseInt(row.Time.split(':')[0]);
        hourlyCafe[hour].glass += row.Glass_Cafeteria_Occupancy;
        hourlyCafe[hour].open += row.Open_Cafeteria_Occupancy;
        hourlyCafe[hour].count += 1;
      });
      const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      return {
        labels,
        datasets: [
          makeDataset('Glass Cafeteria', hourlyCafe.map(h => h.glass / h.count), chartStyles.indigo),
          makeDataset('Open Cafeteria', hourlyCafe.map(h => h.open / h.count), chartStyles.cyan)
        ]
      };
    } else {
      const hourlyOccupancy = Array.from({ length: 24 }, () => ({ students: 0, electricity: 0, count: 0 }));
      filtered.forEach(row => {
        const hour = parseInt(row.Time.split(':')[0]);
        const totalStudents = row.AB1_Students + row.AB2_Students + row.AB3_Students + 
                              row.AB4_Students + row.AB5_Students + row.MAB1_Students + 
                              row.MAB2_Students + row.MAB3_Students + row.MAB4_Students;
        hourlyOccupancy[hour].students += totalStudents;
        hourlyOccupancy[hour].electricity += row.Electricity_Consumption_kWh;
        hourlyOccupancy[hour].count += 1;
      });

      const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
      const meanStudents = hourlyOccupancy.map(h => h.students / h.count);
      const meanElectricity = hourlyOccupancy.map(h => h.electricity / h.count);

      return {
        labels,
        datasets: [
          makeDataset('Students Count', meanStudents, '#f59e0b', 'y'),
          {
            ...makeDataset('Average Load (kWh)', meanElectricity, chartStyles.indigo, 'y1'),
            borderDash: driverChartType === 'bar' ? [] : [3, 3],
            fill: false,
            backgroundColor: 'transparent'
          }
        ]
      };
    }
  }, [dataset, driverSelection, driverChartType, chartMonth, chartDayType, chartStyles]);

  // Dynamic driver chart subtitle
  const driverChartSubtitle = useMemo(() => {
    const monthLabel = chartMonth === 'all' ? 'All Months' : MONTH_LABELS[chartMonth];
    const dayLabel = chartDayType === 'all' ? 'All Days' : chartDayType === 'weekday' ? 'Weekdays' : 'Weekends';
    return `${monthLabel} · ${dayLabel} · Hourly Mean`;
  }, [chartMonth, chartDayType, MONTH_LABELS]);

  const driverChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { bottom: 20 } },
    plugins: {
      legend: { 
        labels: { 
          color: chartStyles.text, 
          font: { family: 'Plus Jakarta Sans', weight: 500 },
          boxWidth: 12,
          usePointStyle: true
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { family: 'Outfit', size: 13 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        borderColor: chartStyles.cyan + '40',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: { 
        grid: { color: chartStyles.grid }, 
        ticks: { color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 11 } } 
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: chartStyles.grid },
        ticks: { color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 11 } },
        title: { 
          display: true, 
          text: (driverSelection === 'hostels') ? 'Energy (kWh)' :
                (driverSelection === 'labs') ? 'Active Computer Labs' : 'Occupancy Count',
          color: chartStyles.text, 
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 } 
        }
      },
      y1: (driverSelection === 'occupancy' || driverSelection === 'labs') ? {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: chartStyles.text, font: { family: 'Plus Jakarta Sans', size: 11 } },
        title: { 
          display: true, 
          text: driverSelection === 'occupancy' ? 'Energy (kWh)' : 'Central Library Occupancy', 
          color: chartStyles.text, 
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 } 
        }
      } : undefined
    }
  };

  // ---------------------------------------------
  // NEW: Campus Zone Breakdown (Doughnut)
  // ---------------------------------------------
  const zoneChartData = useMemo(() => {
    let boys = 0, girls = 0, total = 0;
    globalFilteredDataset.forEach(row => {
      if (row.Boys_Hostel_Load_kWh) boys += row.Boys_Hostel_Load_kWh;
      if (row.Girls_Hostel_Load_kWh) girls += row.Girls_Hostel_Load_kWh;
      if (row.Electricity_Consumption_kWh) total += row.Electricity_Consumption_kWh;
    });
    
    // Academic & Admin is whatever is left over from the total (before solar offset)
    const academicAdmin = Math.max(0, total - boys - girls);
    
    return {
      labels: ['Boys Hostels', 'Girls Hostels', 'Academic & Admin'],
      datasets: [
        {
          data: [boys, girls, academicAdmin],
          backgroundColor: [
            chartStyles.cyan,
            chartStyles.rose,
            chartStyles.indigo
          ],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }, [globalFilteredDataset, chartStyles]);

  const zoneChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: chartStyles.text, font: { family: 'Plus Jakarta Sans' } } },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { family: 'Outfit', size: 13 },
        bodyFont: { family: 'Outfit', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-US').format(Math.round(context.parsed)) + ' kWh';
            }
            return label;
          }
        }
      }
    },
    cutout: '65%'
  };

  // ---------------------------------------------
  // NEW: Time-of-Day vs Day-of-Week Heatmap
  // ---------------------------------------------
  const heatmapData = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    // Initialize matrix
    const matrix = {};
    days.forEach(d => {
      matrix[d] = {};
      hours.forEach(h => {
        matrix[d][h] = { 
          sumNetGrid: 0, 
          sumGrossElec: 0,
          sumSolar: 0,
          sumTemp: 0,
          totalAnomalies: 0,
          count: 0, 
          avgNetGrid: 0 
        };
      });
    });
    
    // Accumulate
    globalFilteredDataset.forEach(row => {
      if (matrix[row.Day] && matrix[row.Day][row.Time]) {
        const cell = matrix[row.Day][row.Time];
        cell.sumNetGrid += row.Net_Grid_Usage_kWh || 0;
        cell.sumGrossElec += row.Electricity_Consumption_kWh || 0;
        cell.sumSolar += row.Solar_Generation_kWh || 0;
        cell.sumTemp += row.Temperature_C || 0;
        cell.totalAnomalies += row.Is_Anomaly || 0;
        cell.count += 1;
      }
    });
    
    let minAvg = Infinity, maxAvg = -Infinity;
    
    // Calculate averages
    days.forEach(d => {
      hours.forEach(h => {
        const cell = matrix[d][h];
        if (cell.count > 0) {
          cell.avgNetGrid = cell.sumNetGrid / cell.count;
          if (cell.avgNetGrid < minAvg) minAvg = cell.avgNetGrid;
          if (cell.avgNetGrid > maxAvg) maxAvg = cell.avgNetGrid;
        }
      });
    });
    
    return { days, hours, matrix, minAvg, maxAvg };
  }, [globalFilteredDataset]);

  return (
    <div className="fade-in-up">
      {/* Aggregate Stats */}
      {stats && (
        <section className="stats-grid">
          <div className="stat-card indigo fade-in-up delay-2">
            <div className="stat-card-header">
              <span className="stat-label">Total Electricity<br />Consumption</span>
              <Zap className="stat-icon" size={20} />
            </div>
            <div>
              <div className="stat-value">
                <AnimatedNumber value={stats.totalElectricity} suffix=" kWh" />
              </div>
              <div className="stat-sub">Cumulative grid load<br />measured overall</div>
            </div>
          </div>
          <div className="stat-card cyan fade-in-up delay-2">
            <div className="stat-card-header">
              <span className="stat-label">Total Solar Energy<br />Generation</span>
              <Sun className="stat-icon" size={20} />
            </div>
            <div>
              <div className="stat-value">
                <AnimatedNumber value={stats.totalSolar} suffix=" kWh" />
              </div>
              <div className="stat-sub">Clean energy offset<br />generated by solar panels</div>
            </div>
          </div>
          <div className="stat-card emerald fade-in-up delay-2">
            <div className="stat-card-header">
              <span className="stat-label">Solar Generation<br />Demand Offset</span>
              <Percent className="stat-icon" size={20} />
            </div>
            <div>
              <div className="stat-value">
                <AnimatedNumber value={stats.solarOffset} suffix=" %" decimals={2} />
              </div>
              <div className="stat-sub">Percentage of total<br />campus demand offset</div>
            </div>
          </div>
          <div className="stat-card violet fade-in-up delay-2">
            <div className="stat-card-header">
              <span className="stat-label">Total Net Grid<br />Energy Usage</span>
              <Activity className="stat-icon" size={20} />
            </div>
            <div>
              <div className="stat-value">
                <AnimatedNumber value={stats.totalNetGrid} suffix=" kWh" />
              </div>
              <div className="stat-sub">Actual electricity drawn<br />from the public grid</div>
            </div>
          </div>
          <div className="stat-card rose fade-in-up delay-2">
            <div className="stat-card-header">
              <span className="stat-label">Total Anomalies<br />Detected</span>
              <AlertTriangle className="stat-icon" size={20} />
            </div>
            <div>
              <div className="stat-value">
                <AnimatedNumber value={stats.totalAnomalies} />
              </div>
              <div className="stat-sub">Hours of unusual or<br />wasteful consumption</div>
            </div>
          </div>
          <div className="stat-card emerald fade-in-up delay-2">
            <div className="stat-card-header">
              <span className="stat-label">Estimated Carbon<br />Footprint</span>
              <Leaf className="stat-icon" size={20} />
            </div>
            <div>
              <div className="stat-value">
                <AnimatedNumber value={stats.carbonFootprint} suffix=" tons" decimals={1} />
              </div>
              <div className="stat-sub">CO2 emissions based on<br />Net Grid usage</div>
            </div>
          </div>
        </section>
      )}

      {/* Visual Charts */}
      <section className="charts-grid">
        {/* Main Chart */}
        <div className="chart-card fade-in-up delay-3">
          <div className="chart-header" style={{ flexDirection: 'column', gap: '0.6rem' }}>
            {/* Title Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 className="chart-title" style={{ margin: 0 }}>Grid Load & Generation</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--input-bg)', padding: '0.2rem 0.6rem', borderRadius: '1rem', border: '1px solid var(--panel-border)' }}>
                {mainChartTitle}
              </span>
            </div>
            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              {/* Month Selector Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={13} style={{ color: 'var(--text-secondary)', marginRight: '0.15rem' }} />
                <div style={{ display: 'flex', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '2px' }}>
                  {[{ key: 'all', label: 'All' }, { key: '01', label: 'Jan' }, { key: '02', label: 'Feb' }, { key: '03', label: 'Mar' }, { key: '04', label: 'Apr' }, { key: '05', label: 'May' }, { key: '06', label: 'Jun' }].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setChartMonth(m.key)}
                      className="page-btn"
                      style={{ 
                        padding: '0.2rem 0.45rem', borderRadius: '0.35rem', fontSize: '0.7rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        background: chartMonth === m.key ? 'var(--accent-indigo)' : 'transparent',
                        color: chartMonth === m.key ? '#fff' : 'var(--text-primary)',
                        fontWeight: chartMonth === m.key ? 600 : 400
                      }}
                    >{m.label}</button>
                  ))}
                </div>
              </div>

              {/* Aggregation Level */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <BarChart3 size={13} style={{ color: 'var(--text-secondary)', marginRight: '0.15rem' }} />
                <div style={{ display: 'flex', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '2px' }}>
                  {[{ key: 'daily', label: 'Daily' }, { key: 'weekly', label: 'Weekly' }, ...(chartMonth !== 'all' ? [{ key: 'hourly', label: 'Hourly' }] : [])].map(a => (
                    <button
                      key={a.key}
                      onClick={() => setChartAggregation(a.key)}
                      className="page-btn"
                      style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.7rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        background: chartAggregation === a.key ? 'var(--accent-cyan)' : 'transparent',
                        color: chartAggregation === a.key ? '#fff' : 'var(--text-primary)',
                        fontWeight: chartAggregation === a.key ? 600 : 400
                      }}
                    >{a.label}</button>
                  ))}
                </div>
              </div>

              {/* Day Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Filter size={13} style={{ color: 'var(--text-secondary)', marginRight: '0.15rem' }} />
                <div style={{ display: 'flex', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '2px' }}>
                  {[{ key: 'all', label: 'All Days' }, { key: 'weekday', label: 'Weekdays' }, { key: 'weekend', label: 'Weekends' }].map(d => (
                    <button
                      key={d.key}
                      onClick={() => setChartDayType(d.key)}
                      className="page-btn"
                      style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.7rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        background: chartDayType === d.key ? 'var(--accent-emerald)' : 'transparent',
                        color: chartDayType === d.key ? '#fff' : 'var(--text-primary)',
                        fontWeight: chartDayType === d.key ? 600 : 400
                      }}
                    >{d.label}</button>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Chart Type Toggle */}
              <div style={{ display: 'flex', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '2px' }}>
                {['line', 'bar', 'area'].map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className="page-btn"
                    style={{ 
                      padding: '0.2rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.7rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                      background: chartType === type ? 'var(--accent-rose)' : 'transparent',
                      color: chartType === type ? '#fff' : 'var(--text-primary)',
                      fontWeight: chartType === type ? 600 : 400
                    }}
                  >{type.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-body">
            {chartType === 'bar' ? (
              <Bar data={mainChartData} options={mainChartOptions} />
            ) : (
              <Line data={mainChartData} options={mainChartOptions} />
            )}
          </div>
        </div>

        {/* Secondary Driver Chart */}
        <div className="chart-card fade-in-up delay-3">
          <div className="chart-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 className="chart-title" style={{ margin: 0 }}>Energy Demand Drivers</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--input-bg)', padding: '0.2rem 0.6rem', borderRadius: '1rem', border: '1px solid var(--panel-border)' }}>
                {driverChartSubtitle}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Infographic Chart Type Controls */}
              <div style={{ display: 'flex', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '0.5rem', padding: '2px' }}>
                {['line', 'bar', 'area'].map(type => (
                  <button
                    key={type}
                    onClick={() => setDriverChartType(type)}
                    className="page-btn"
                    style={{ 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '0.35rem', 
                      fontSize: '0.75rem', 
                      border: 'none',
                      background: driverChartType === type ? 'var(--accent-indigo)' : 'transparent',
                      color: driverChartType === type ? '#fff' : 'var(--text-primary)',
                      fontWeight: driverChartType === type ? 600 : 400
                    }}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>

              <select 
                className="chart-select"
                value={driverSelection}
                onChange={(e) => setDriverSelection(e.target.value)}
              >
                <option value="hostels">Hostel Loads (Boys vs Girls)</option>
                <option value="occupancy">Occupancy vs. Electricity</option>
                <option value="academic">Academic Blocks Occupancy</option>
                <option value="mblocks">M-Blocks Occupancy</option>
                <option value="labs">Labs & Library Activity</option>
                <option value="cafeteria">Cafeteria Occupancy</option>
              </select>
            </div>
          </div>
          <div className="chart-body">
            {driverChartType === 'bar' ? (
              <Bar data={driverChartData} options={driverChartOptions} />
            ) : (
              <Line data={driverChartData} options={driverChartOptions} />
            )}
          </div>
        </div>
      </section>

      {/* NEW: Secondary Insights Grid (Zone Doughnut + Heatmap) */}
      <section className="charts-grid" style={{ gridTemplateColumns: '1fr 2fr', marginTop: '1.5rem' }}>
        
        {/* Campus Zone Breakdown */}
        <div className="chart-card fade-in-up delay-4">
          <div className="chart-header">
            <h2 className="chart-title" style={{ margin: 0 }}>Campus Zone Energy Breakdown</h2>
            <div className="chart-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{chartMonth === 'all' ? 'All Months' : MONTH_LABELS[chartMonth]}{chartDayType === 'all' ? '' : chartDayType === 'weekday' ? ' · Weekdays' : ' · Weekends'}</div>
          </div>
          <div className="chart-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={zoneChartData} options={zoneChartOptions} />
          </div>
        </div>

        {/* Heatmap */}
        <div className="chart-card fade-in-up delay-4">
          <div className="chart-header">
            <h2 className="chart-title" style={{ margin: 0 }}>Time-of-Day Net Grid Demand Heatmap</h2>
            <div className="chart-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{chartMonth === 'all' ? 'All Months' : MONTH_LABELS[chartMonth]}{chartDayType === 'all' ? '' : chartDayType === 'weekday' ? ' · Weekdays' : ' · Weekends'}</div>
          </div>
          <div className="chart-body" style={{ height: '300px', display: 'flex', flex: 1, flexDirection: 'column', overflow: 'visible' }}>
            <div ref={heatmapContainerRef} style={{ display: 'flex', flex: 1, position: 'relative' }}>
              {/* Y-axis Labels */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingRight: '10px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>
                {heatmapData.days.map(d => <div key={d}>{d.substring(0,3)}</div>)}
              </div>
              
              {/* Heatmap Grid */}
              <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: '2px' }}>
                {heatmapData.days.map(d => (
                  <div key={d} style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '2px' }}>
                    {heatmapData.hours.map(h => {
                      const cell = heatmapData.matrix[d][h];
                      const hasData = cell.count > 0;
                      const avg = cell.avgNetGrid;
                      
                      // Normalize between 0 and 1 only for active cells
                      const normalized = hasData 
                        ? (avg - heatmapData.minAvg) / (heatmapData.maxAvg - heatmapData.minAvg || 1)
                        : 0;
                        
                      // Color interpolations: Use theme-aware gray for no data
                      const r = hasData ? Math.round(99 + normalized * (244 - 99)) : (theme === 'dark' ? 31 : 243);
                      const g = hasData ? Math.round(102 - normalized * (102 - 63)) : (theme === 'dark' ? 41 : 244);
                      const b = hasData ? Math.round(241 - normalized * (241 - 94)) : (theme === 'dark' ? 55 : 246);
                      
                      return (
                        <div 
                          key={`${d}-${h}`} 
                          onMouseEnter={(e) => {
                            if (!hasData || !heatmapContainerRef.current) return;
                            const rect = e.target.getBoundingClientRect();
                            const containerRect = heatmapContainerRef.current.getBoundingClientRect();
                            setHeatmapHover({
                              x: rect.left - containerRect.left + rect.width / 2,
                              y: rect.top - containerRect.top - 10,
                              day: d,
                              time: h,
                              val: Math.round(cell.sumNetGrid / (cell.count || 1)),
                              gross: Math.round(cell.sumGrossElec / (cell.count || 1)),
                              solar: Math.round(cell.sumSolar / (cell.count || 1)),
                              temp: (cell.sumTemp / (cell.count || 1)).toFixed(1),
                              anomalies: cell.totalAnomalies
                            });
                          }}
                          onMouseLeave={() => setHeatmapHover(null)}
                          style={{ 
                            backgroundColor: `rgb(${r}, ${g}, ${b})`,
                            borderRadius: '2px',
                            opacity: hasData ? (normalized < 0.1 ? 0.15 : 0.4 + (normalized * 0.6)) : 0.4,
                            cursor: hasData ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            transform: hasData && heatmapHover?.day === d && heatmapHover?.time === h ? 'scale(1.15)' : 'scale(1)',
                            zIndex: hasData && heatmapHover?.day === d && heatmapHover?.time === h ? 10 : 1,
                            border: hasData ? 'none' : (theme === 'dark' ? '1px dashed rgba(255,255,255,0.05)' : '1px dashed rgba(0,0,0,0.05)')
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              
              {/* Custom Tooltip for Heatmap */}
              {heatmapHover && (
                <div style={{
                  position: 'absolute',
                  left: heatmapHover.x,
                  top: heatmapHover.y,
                  transform: parseInt(heatmapHover.time) >= 18 ? 'translate(-100%, -100%)' : 'translate(-50%, -100%)',
                  backgroundColor: 'rgba(17, 24, 39, 0.98)',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  pointerEvents: 'none',
                  zIndex: 9999,
                  border: '1px solid var(--accent-indigo)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  fontFamily: 'Outfit, sans-serif',
                  marginLeft: parseInt(heatmapHover.time) >= 18 ? '-15px' : '0',
                  minWidth: '220px'
                }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    {heatmapHover.day} at {heatmapHover.time}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Net Grid Usage:</span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{heatmapHover.val.toLocaleString()} kWh</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gross Consumption:</span>
                      <span style={{ color: '#bbb' }}>{heatmapHover.gross.toLocaleString()} kWh</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Solar Generation:</span>
                      <span style={{ color: 'var(--accent-emerald)' }}>-{heatmapHover.solar.toLocaleString()} kWh</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Avg Temp:</span>
                      <span style={{ color: 'var(--accent-rose)' }}>{heatmapHover.temp}°C</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', borderTop: '1px dotted rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                      <span>Anomalies Flagged:</span>
                      <span style={{ color: heatmapHover.anomalies > 0 ? 'var(--accent-rose)' : '#999', fontWeight: 600 }}>{heatmapHover.anomalies} hrs</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* X-axis Labels */}
            <div style={{ display: 'flex', marginLeft: '35px', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '5px' }}>
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
            </div>
          </div>
        </div>

      </section>

      {/* Datatable */}
      <section className="data-panel fade-in-up delay-4">
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            <div className="search-container" style={{ minWidth: '200px' }}>
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search any value..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              className="chart-select"
              value={tableMonth}
              onChange={(e) => setTableMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {Object.entries(MONTH_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select 
              className="chart-select"
              value={tableDayType}
              onChange={(e) => setTableDayType(e.target.value)}
            >
              <option value="all">All Days</option>
              <option value="weekday">Weekdays</option>
              <option value="weekend">Weekends</option>
            </select>

            <select 
              className="chart-select"
              value={tableViewType}
              onChange={(e) => setTableViewType(e.target.value)}
              style={{ fontWeight: '500', color: 'var(--primary)' }}
            >
              <option value="hourly">Hourly Breakdown</option>
              <option value="daily">Daily Totals</option>
            </select>

            <select 
              className="chart-select"
              value={tableColumnCategory}
              onChange={(e) => setTableColumnCategory(e.target.value)}
              style={{ fontWeight: '500' }}
            >
              <option value="all">All Columns</option>
              <option value="ab">Academic Blocks (AB)</option>
              <option value="mab">M-Academic Blocks (MAB)</option>
              <option value="facilities">Facilities & Hostels</option>
              <option value="energy">Energy & Climate</option>
            </select>
          </div>

          <div className="toolbar-actions">
            <select 
              className="chart-select" 
              style={{ padding: '0.6rem 1rem' }}
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div className="table-wrapper" style={{ overflowX: 'auto', maxWidth: '100vw' }}>
          <table style={{ whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                {columnsToDisplay.map((col) => (
                  <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
                    {col.replace(/_/g, ' ')} {sortColumn === col ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx}>
                  {columnsToDisplay.map((col, i) => {
                    const val = row[col];
                    return (
                      <td key={i}>
                        {col === 'Day' ? <span className="badge badge-blue">{val}</span> : 
                         typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(2) : val) : 
                         val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedData.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
            </div>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(c => c - 1)} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Pagination buttons */}
              {(() => {
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }
                
                return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                  const p = startPage + i;
                  return (
                    <button 
                      key={p} 
                      className={`page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  );
                });
              })()}

              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(c => c + 1)} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
