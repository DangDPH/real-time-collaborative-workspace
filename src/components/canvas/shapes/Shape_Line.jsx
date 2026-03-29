import React from 'react';
import { Line } from 'react-konva';

// this is for pencil
const LineShape = ({ shapeProps }) => {
  return (
    <Line
      points={shapeProps.points}       // array of x,y coordinates
      stroke={shapeProps.stroke}       // color of the line
      strokeWidth={shapeProps.strokeWidth} // thickness
      tension={0.5}                    // smoothness of line
      lineCap="round"                  // caps at the end of lines
      lineJoin="round"                 // smooth corners
      globalCompositeOperation={
        shapeProps.tool === 'eraser' ? 'destination-out' : 'source-over'
      }
    />
  );
};

export default LineShape;