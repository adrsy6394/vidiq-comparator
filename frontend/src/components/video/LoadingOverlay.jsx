import React from 'react';
import Loader from '../common/Loader.jsx';

const LoadingOverlay = ({ steps }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-lg p-6">
        <Loader steps={steps} />
      </div>
    </div>
  );
};

export default LoadingOverlay;
