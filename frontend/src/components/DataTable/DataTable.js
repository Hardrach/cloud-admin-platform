import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { SkeletonTable } from '../Skeleton/Skeleton';
import { EmptyState } from '../EmptyState/EmptyState';
import './DataTable.css';

export const DataTable = ({
  columns = [],
  data = [],
  sortable = true,
  filterable = true,
  pageSize = 10,
  loading = false,
  emptyMessage,
  emptyVariant = 'no-data',
}) => {
  const [sortConfig, setSortConfig] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const requestSort = (key) => {
    if (!sortable) return;
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortConfig.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Filtering (Global Simple Case Search)
  const filteredData = useMemo(() => {
    if (!filterText) return sortedData;
    return sortedData.filter((item) => {
      return columns.some((col) => {
        const val = item[col.key];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(filterText.toLowerCase());
      });
    });
  }, [sortedData, filterText, columns]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset page when filter changes
  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <SkeletonTable cols={columns.length} rows={pageSize} />;
  }

  if (data.length === 0) {
    return <EmptyState variant={emptyVariant} description={emptyMessage} />;
  }

  return (
    <div className="datatable-wrapper">
      {filterable && (
        <div className="datatable-filter-bar mb-3">
          <div className="datatable-search-wrapper">
            <Search className="datatable-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search table records..."
              value={filterText}
              onChange={handleFilterChange}
              className="datatable-search-input"
            />
          </div>
        </div>
      )}

      <div className="datatable-scrollable">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width || 'auto', cursor: sortable ? 'pointer' : 'default' }}
                  onClick={() => requestSort(col.key)}
                >
                  <div className="d-flex align-items-center gap-1">
                    <span>{col.label}</span>
                    {sortable && sortConfig?.key === col.key && (
                      <span className="sort-icon-wrapper">
                        {sortConfig.direction === 'ascending' ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-secondary">
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="datatable-pagination-bar mt-3 d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length} entries
          </div>
          <div className="pagination-controls d-flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-info small px-2 d-flex align-items-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
