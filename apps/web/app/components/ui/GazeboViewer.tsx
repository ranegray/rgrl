import React from 'react';

const GazeboViewer = () => {
  return (
    <iframe 
      src="http://localhost:8080" 
      style={{ width: '100%', height: '50vh', border: 'none' }}
      title="Gazebo Viewer"
    />
  );
};

export default GazeboViewer;
