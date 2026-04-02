import React from 'react';
import ShapeLine from './shapes/Shape_Line';
import ShapeSVG from './shapes/Shape_SVG'; 
import ShapeText from './shapes/Shape_text.jsx';

const ShapeComponents = {
  LINE: ShapeLine,
  SVG_PATH: ShapeSVG, 
  TEXT: ShapeText,
};

// THÊM mode, onErase VÀO ĐÂY:
const ShapeRenderer = ({ shape, isSelected, onSelect, onChange, outlineThickness, mode, onEraseStart }) => {
  const SpecificShape = ShapeComponents[shape.type];

  if (!SpecificShape) return null;

  return (
    <SpecificShape
      shapeProps={shape}
      isSelected={isSelected}
      onSelect={onSelect}
      onChange={onChange}
      outlineThickness={outlineThickness}
      mode={mode} 
      onEraseStart={onEraseStart} 
    />
  );
};

export default ShapeRenderer;