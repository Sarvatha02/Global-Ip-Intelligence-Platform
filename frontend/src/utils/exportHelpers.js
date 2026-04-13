// FILE LOCATION: frontend/src/utils/exportHelpers.js
// Export utilities for analytics data (CSV, JSON, Image)

/**
 * ========================================
 * CSV EXPORT
 * ========================================
 */

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Filename without extension
 * @param {Array} headers - Optional custom headers
 * @returns {Boolean} Success status
 */
export const exportToCSV = (data, filename, headers = []) => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return false;
    }

    let csvContent = '';

    // Add headers
    if (headers.length > 0) {
      csvContent += headers.join(',') + '\n';
    } else if (data.length > 0) {
      const keys = Object.keys(data[0]);
      csvContent += keys.join(',') + '\n';
    }

    // Add data rows
    data.forEach(row => {
      const values = Object.values(row).map(val => {
        // Handle null/undefined
        if (val === null || val === undefined) return '';
        
        // Convert to string
        let strVal = String(val);
        
        // Escape commas and quotes
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          strVal = `"${strVal.replace(/"/g, '""')}"`;
        }
        
        return strVal;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create and download blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}_${getTimestamp()}.csv`);

    return true;
  } catch (error) {
    console.error('CSV export failed:', error);
    return false;
  }
};

/**
 * Export field-wise trends to CSV
 * @param {Array} trends - Field trends data
 * @param {String} filename - Filename
 * @returns {Boolean} Success status
 */
export const exportFieldTrendsToCSV = (trends, filename = 'field-wise-trends') => {
  const headers = ['Field', 'Patent Count', 'Growth Rate (%)', 'Percentage of Total'];
  const formattedData = trends.map(item => ({
    field: item.field,
    count: item.count,
    growth: item.growth.toFixed(2),
    percentage: item.percentage ? item.percentage.toFixed(2) : '-'
  }));
  
  return exportToCSV(formattedData, filename, headers);
};

/**
 * ========================================
 * JSON EXPORT
 * ========================================
 */

/**
 * Export data to JSON format
 * @param {Object|Array} data - Data to export
 * @param {String} filename - Filename without extension
 * @returns {Boolean} Success status
 */
export const exportToJSON = (data, filename) => {
  try {
    if (!data) {
      console.warn('No data to export');
      return false;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, `${filename}_${getTimestamp()}.json`);

    return true;
  } catch (error) {
    console.error('JSON export failed:', error);
    return false;
  }
};

/**
 * ========================================
 * IMAGE EXPORT
 * ========================================
 */

/**
 * Export chart as PNG image
 * @param {String} chartId - ID of chart element
 * @param {String} filename - Filename without extension
 * @returns {Promise<Boolean>} Success status
 */
export const exportChartAsImage = async (chartId, filename) => {
  try {
    const chartElement = document.querySelector(`#${chartId}`);
    if (!chartElement) {
      console.error('Chart element not found');
      return false;
    }

    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) {
      console.error('SVG element not found in chart');
      return false;
    }

    // Get SVG dimensions
    const bbox = svgElement.getBBox();
    const width = bbox.width || 800;
    const height = bbox.height || 600;

    // Serialize SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Load and draw image
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          downloadBlob(blob, `${filename}_${getTimestamp()}.png`);
          URL.revokeObjectURL(url);
          resolve(true);
        });
      };

      img.onerror = () => {
        console.error('Failed to load SVG image');
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  } catch (error) {
    console.error('Image export failed:', error);
    return false;
  }
};

/**
 * ========================================
 * EXCEL EXPORT (via CSV)
 * ========================================
 */

/**
 * Export multiple sheets to Excel-compatible CSV
 * @param {Object} sheets - { sheetName: data[] }
 * @param {String} filename - Filename without extension
 * @returns {Boolean} Success status
 */
export const exportToExcel = (sheets, filename) => {
  try {
    let csvContent = '';

    Object.entries(sheets).forEach(([sheetName, data], index) => {
      if (index > 0) csvContent += '\n\n';
      
      // Add sheet name as header
      csvContent += `=== ${sheetName} ===\n`;
      
      // Add headers
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csvContent += headers.join(',') + '\n';
        
        // Add data
        data.forEach(row => {
          const values = Object.values(row).map(val => {
            if (val === null || val === undefined) return '';
            let strVal = String(val);
            if (strVal.includes(',') || strVal.includes('"')) {
              strVal = `"${strVal.replace(/"/g, '""')}"`;
            }
            return strVal;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}_${getTimestamp()}.csv`);

    return true;
  } catch (error) {
    console.error('Excel export failed:', error);
    return false;
  }
};

/**
 * ========================================
 * PDF EXPORT (requires backend)
 * ========================================
 */

/**
 * Generate PDF report via backend
 * @param {Object} data - Data to include in PDF
 * @param {String} reportType - Type of report
 * @returns {Promise<Boolean>} Success status
 */
export const generatePDFReport = async (data, reportType = 'dashboard') => {
  try {
    console.log('PDF generation would be handled by backend API');
    console.log('Report type:', reportType);
    console.log('Data:', data);
    
    // This would call your backend endpoint:
    // const response = await analyticsAPI.exportAnalytics(reportType, 'pdf', data);
    // if (response) {
    //   downloadBlob(response, `report_${getTimestamp()}.pdf`);
    // }
    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
};

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Download blob as file
 * @param {Blob} blob - Blob data
 * @param {String} filename - Filename with extension
 */
const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Get current timestamp for filenames
 * @returns {String} Formatted timestamp (YYYY-MM-DD)
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Format data for export
 * @param {Array} data - Raw data
 * @param {Object} fieldMap - Field name mappings
 * @returns {Array} Formatted data
 */
export const formatDataForExport = (data, fieldMap = {}) => {
  return data.map(item => {
    const formatted = {};
    Object.entries(item).forEach(([key, value]) => {
      const newKey = fieldMap[key] || key;
      formatted[newKey] = value;
    });
    return formatted;
  });
};

/**
 * Copy data to clipboard
 * @param {String} text - Text to copy
 * @returns {Promise<Boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Export summary statistics
 * @param {Object} summary - Summary data
 * @param {String} filename - Filename
 * @returns {Boolean} Success status
 */
export const exportSummaryStats = (summary, filename = 'summary-stats') => {
  const data = Object.entries(summary).map(([key, value]) => ({
    metric: key.replace(/([A-Z])/g, ' $1').trim(),
    value: value
  }));
  
  return exportToCSV(data, filename, ['Metric', 'Value']);
};