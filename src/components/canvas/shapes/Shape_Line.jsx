import React, { useRef, useEffect } from 'react';
import { Group, Line, Transformer } from 'react-konva';

const LineShape = ({ shapeProps, isSelected, onSelect, onChange, outlineThickness, mode, onEraseStart }) => {
  const groupRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Tách các thuộc tính Transform ra cho Group, Line con sẽ nằm ở 0,0
  const { x, y, scaleX, scaleY, rotation, eraserStrokes, ...lineProps } = shapeProps;

  return (
    <React.Fragment>
      <Group
        id={shapeProps.id}
        ref={groupRef}
        x={x || 0}
        y={y || 0}
        scaleX={scaleX || 1}
        scaleY={scaleY || 1}
        rotation={rotation || 0}
        draggable={false}
        
        onMouseDown={(e) => {
          if (mode === 'select') onSelect();
        }}
        
        onDragEnd={(e) => {
          if (mode === 'select') {
            onChange({
              ...shapeProps,
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
        onTransformEnd={(e) => {
          if (mode === 'select') {
            const node = groupRef.current;
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              rotation: node.rotation(),
            });
          }
        }}
      >
        {/* Nét vẽ gốc */}
        {shapeProps.multiPoints ? (
          shapeProps.multiPoints.map((pts, i) => (
            <Line
              key={i}
              {...lineProps}
              x={0} y={0}
              points={pts}
              stroke={shapeProps.stroke}
              strokeWidth={shapeProps.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              hitStrokeWidth={Math.max(20, (shapeProps.strokeWidth || 2) + 10)}
            />
          ))
        ) : (
          <Line
            {...lineProps}
            x={0} y={0}
            points={shapeProps.points}
            stroke={shapeProps.stroke}
            strokeWidth={shapeProps.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            hitStrokeWidth={Math.max(20, (shapeProps.strokeWidth || 2) + 10)}
          />
        )}

        {/* Các vết tẩy đục lỗ đính kèm theo nét vẽ */}
        {eraserStrokes && eraserStrokes.map((stroke, i) => (
          <Line
            key={i}
            points={stroke.points}
            strokeWidth={stroke.brushSize}
            stroke="white"
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation="destination-out"
          />
        ))}
      </Group>
      
      {isSelected && mode === 'select' && <Transformer ref={trRef} borderStrokeWidth={outlineThickness} borderStroke='#7FB9F9' />}
    </React.Fragment>
  );
};

export default LineShape;