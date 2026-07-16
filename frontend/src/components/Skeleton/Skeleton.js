import React from 'react';
import './Skeleton.css';

export const SkeletonLine = ({ width = '100%', height = '16px', className = '' }) => {
  return (
    <div
      className={`skeleton-item skeleton-line ${className}`}
      style={{ width, height }}
    />
  );
};

export const SkeletonCircle = ({ size = '40px', className = '' }) => {
  return (
    <div
      className={`skeleton-item skeleton-circle ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export const SkeletonCard = ({ rows = 3, className = '' }) => {
  return (
    <div className={`skeleton-card-container card-base ${className}`}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <SkeletonCircle size="42px" />
        <SkeletonLine width="40%" height="20px" />
      </div>
      <div className="d-flex flex-column gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} width={i === rows - 1 ? '60%' : '100%'} height="14px" />
        ))}
      </div>
    </div>
  );
};

export const SkeletonTable = ({ cols = 4, rows = 5, className = '' }) => {
  return (
    <div className={`skeleton-table-container card-base ${className}`}>
      <div className="skeleton-table-header d-flex justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-10">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width={`${90 / cols}%`} height="18px" />
        ))}
      </div>
      <div className="d-flex flex-column gap-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="d-flex justify-content-between">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonLine key={c} width={`${85 / cols}%`} height="14px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonChart = ({ className = '' }) => {
  return (
    <div className={`skeleton-chart-container card-base ${className}`}>
      <div className="d-flex justify-content-between mb-5">
        <SkeletonLine width="30%" height="20px" />
        <SkeletonLine width="15%" height="16px" />
      </div>
      <div className="skeleton-chart-visual d-flex align-items-end gap-3" style={{ height: '200px' }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const heights = ['40%', '60%', '30%', '80%', '50%', '90%', '70%', '45%', '65%', '35%', '85%', '55%'];
          return (
            <div
              key={i}
              className="skeleton-item skeleton-chart-bar"
              style={{ height: heights[i % heights.length], flex: 1 }}
            />
          );
        })}
      </div>
    </div>
  );
};

const Skeleton = {
  Line: SkeletonLine,
  Circle: SkeletonCircle,
  Card: SkeletonCard,
  Table: SkeletonTable,
  Chart: SkeletonChart,
};

export default Skeleton;
