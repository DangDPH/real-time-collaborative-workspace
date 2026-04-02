import React, { useRef, useEffect } from 'react';
import { Group, Path, Line, Transformer } from 'react-konva';

const Shape_SVG = ({ shapeProps, isSelected, onSelect, onChange, outlineThickness, mode, onEraseStart }) => {
  const groupRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Tách x, y, scale, rotation ra khỏi pathProps vì Group sẽ đảm nhận việc dịch chuyển
  const { x, y, scaleX, scaleY, rotation, eraserStrokes, ...pathProps } = shapeProps;

  return (
    <React.Fragment>
      <Group
        id={shapeProps.id} // Bắt buộc có ID để truy xuất tọa độ Local
        ref={groupRef}
        x={x} y={y}
        scaleX={scaleX || 1} scaleY={scaleY || 1}
        rotation={rotation || 0}
        draggable={mode === 'select'}

        onMouseDown={(e) => {
          if (mode === 'eraser') onEraseStart(e);
          else if (mode === 'select') onSelect();
        }}

        onDragEnd={(e) => {
          if (mode === 'select') {
            onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
          }
        }}

        onTransformEnd={(e) => {
          if (mode === 'select') {
            const node = groupRef.current;
            onChange({
              ...shapeProps,
              x: node.x(), y: node.y(),
              scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation(),
            });
          }
        }}
      >
        {/* HÌNH GỐC */}
        <Path
          {...pathProps}
          x={0} y={0} // Đặt về 0 vì Group Parent đã lo việc tọa độ
          stroke={shapeProps.stroke || 'black'}
          strokeWidth={shapeProps.strokeWidth || 2}
          hitStrokeWidth={10}
        />

        {/* CÁC NÉT TẨY ĐÍNH KÈM (MẶT NẠ) */}
        {eraserStrokes && eraserStrokes.map((stroke, i) => (
          <Line
            key={i}
            points={stroke.points}
            strokeWidth={stroke.brushSize}
            stroke="white" 
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation="destination-out" // Cắt lỗ từ nét vẽ
          />
        ))}
      </Group>
      {isSelected && mode === 'select' && <Transformer ref={trRef} borderStrokeWidth={outlineThickness} borderStroke='#7FB9F9' />}
    </React.Fragment>
  );
};

export default Shape_SVG;