import React from 'react';
import './Skeleton.scss';

export const Skeleton = ({ variant = 'text', width, height, className = '', style = {} }) => (
  <div
    className={`pm-skeleton pm-skeleton--${variant} ${className}`}
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
);

export const ReportSkeleton = () => (
  <div className="pm-skeleton-group" aria-busy="true" aria-label="Loading report">
    <Skeleton variant="ring" />
    <Skeleton variant="heading" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="card" />
    <Skeleton variant="card" />
    <Skeleton variant="card" />
  </div>
);

export default Skeleton;

