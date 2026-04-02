import React, { useState, useEffect, useRef } from 'react';
import { Group, Text, Line, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

const Shape_Text = ({ shapeProps, isSelected, onSelect, onChange, outlineThickness, mode, onEraseStart }) => {
  const groupRef = useRef();
  const trRef = useRef();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSelected && !isEditing && trRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.getLayer()?.batchDraw();
    }
  }, [shapeProps.text]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    onSelect(); 
  };

  const { x, y, scaleX, scaleY, rotation, eraserStrokes, ...textProps } = shapeProps;

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
        draggable={!isEditing && mode === 'select'}
        
        onMouseDown={(e) => {
          if (mode === 'select') onSelect();
        }}
        
        onDblClick={mode === 'select' ? handleDoubleClick : null}
        
        onDragEnd={(e) => {
          if (mode === 'select') {
            onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
          }
        }}
        onTransformEnd={() => {
          if (mode === 'select') {
            const node = groupRef.current;
            const sX = node.scaleX();
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              width: Math.max(30, (shapeProps.width || 100) * sX),
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }
        }}
      >
        <Text
          {...textProps}
          x={0} y={0}
          text={shapeProps.text}
          visible={!isEditing}
          align={shapeProps.align || 'left'}
          lineHeight={1.2}
          padding={5}
          wrap='word'
          width={shapeProps.width}
          height={shapeProps.height}
        />

        {/* Các vết tẩy đục lỗ */}
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

      {isEditing && (
        <Html>
          <textarea
            value={shapeProps.text}
            onChange={(e) => {
              const textarea = e.target;
              textarea.style.height = 'auto';
              textarea.style.height = textarea.scrollHeight + 'px';

              onChange({ ...shapeProps, 
                text: textarea.value,
                height: textarea.scrollHeight 
              });
            }}
            onBlur={() => setIsEditing(false)}
            style={{
              position: 'absolute',
              top: `${y || 0}px`, // Vẫn bám theo vị trí tuyệt đối của Group
              left: `${x || 0}px`,
              width: `${shapeProps.width}px`,
              minHeight: '20px',
              fontSize: `${shapeProps.fontSize}px`,
              fontFamily: shapeProps.fontFamily,
              fontWeight: shapeProps.fontStyle?.includes('bold') ? 'bold' : 'normal',
              fontStyle: shapeProps.fontStyle?.includes('italic') ? 'italic' : 'normal',
              textDecoration: shapeProps.textDecoration,
              textAlign: shapeProps.align || 'left',
              color: shapeProps.fill,
              border: '1px dashed #3b82f6',
              background: 'transparent',
              outline: 'none',
              transform: `rotate(${rotation || 0}deg)`,
              transformOrigin: 'top left',
              lineHeight: 1.2,
              padding: '5px',
              margin: '0px',
              overflow: 'hidden',
              resize: 'none',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word'
            }}
            autoFocus
          />
        </Html>
      )}

      {isSelected && !isEditing && mode === 'select' && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30) return oldBox;
            return newBox;
          }}
          borderStrokeWidth={outlineThickness}
          borderStroke='#7FB9F9'
        />
      )}
    </React.Fragment>
  );
};

export default Shape_Text;