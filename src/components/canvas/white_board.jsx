import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import ShapeRenderer from './shape_renderer';
import ShapeSelector from './shapes/Shape_Selector';
import CanvasTextBox from '../CanvasTextBox';

import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000'); // CONNECT TO BACKEND SERVER IN HẺRE

const Whiteboard = () => {
  const sidebarWidth = 250; 
  
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - sidebarWidth,
    height: window.innerHeight,
  });

  // Text Modal State
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [pendingTextShape, setPendingTextShape] = useState(null);

  // Handle window resizing to keep the canvas responsive
  useEffect(() => {
    const handleResize = () => setStageSize({ width: window.innerWidth - sidebarWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch initial shapes from the server when the component mounts
    socket.on('receive-shape', (incomingShape) => {
      setShapes((prev) => {
        const index = prev.findIndex((s) => s.id === incomingShape.id);
        if (index > -1) {
          // if shape already exists, update it
          const newShapes = [...prev];
          newShapes[index] = incomingShape;
          return newShapes;
        }
        // if shape is new, add it to the list
        return [...prev, incomingShape];
      });
    });

    // fetch initial shapes from the server when the component mounts
    socket.on('delete-shape', (deletedId) => {
      setShapes((prev) => prev.filter((s) => s.id !== deletedId));
    });

    return () => socket.off(); // cleanup listeners on unmount
  }, []);

  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedTextBoxId, setSelectedTextBoxId] = useState(null);

  const [mode, setMode] = useState('select'); 
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const outlineThickness = 2; // mặc định và cố định, slider đã ẩn

  const isDrawing = useRef(false);

  // FIXED: Optimized function to add new shapes without "not implemented" error
  const handleSelectShape = (type, svgData = null) => {
    // For TEXT type, create textbox directly
    if (type === 'TEXT') {
      const newTextBox = {
        id: uuidv4(),
        type: 'TEXT',
        x: 150,
        y: 150,
        width: 400,
        height: 220,
        content: '<p>New text box</p>',
        bold: false,
        italic: false,
        underline: false,
        align: 'left',
      };
      setTextBoxes([...textBoxes, newTextBox]);
      setSelectedTextBoxId(newTextBox.id);
      // Keep selectedId as is - don't clear it to prevent toolbar from hiding
      return;
    }

    let newShape = null;

    // 2. Generic SVG Path handler for complex shapes
    if (type === 'SVG_PATH') {
      newShape = { 
        id: uuidv4(), 
        type: 'SVG_PATH', 
        x: 100, 
        y: 100, 
        data: svgData, 
        fill: 'none', 
        stroke: '#000000',
        strokeWidth: 2,
        scaleX: 1, 
        scaleY: 1, 
        rotation: 0 
      };
    }

    // Safety check to ensure the shape type is handled
    if (!newShape) {
      alert('Shape type not supported: ' + type);
      return;
    }

    setShapes([...shapes, newShape]);
    socket.emit('send-shape', newShape);
    setMode('select'); 
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete the entire drawing board?")) {
      setShapes([]);
      setSelectedId(null);
    }
  };

  const handleMouseDown = (e) => {

    // Check if user clicked on empty area (not on any shape)
    const isOverlay = e.target.id() === 'drawing-overlay';
    const clickedOnEmpty = e.target === e.target.getStage() || isOverlay;

    if (clickedOnEmpty) setSelectedId(null);
    if (mode === 'select') return;

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();

    const newLine = { 
      id: uuidv4(), 
      type: 'LINE', 
      tool: mode, 
      points: [pos.x, pos.y], 
      stroke: mode === 'eraser' ? '#ffffff' : brushColor, 
      strokeWidth: brushSize,
      tension: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
      globalCompositeOperation: mode === 'eraser' ? 'destination-out' : 'source-over'
    };
    setShapes([...shapes, newLine]);
  };

  const handleMouseMove = (e) => {
    if (mode === 'select' || !isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const lastShapes = [...shapes];
    const lastLine = lastShapes[lastShapes.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lastShapes.splice(lastShapes.length - 1, 1, lastLine);
    setShapes(lastShapes);
  };

  const handleMouseUp = () => isDrawing.current = false;

  const updateSelectedShape = (key, value) => {
    const newShapes = shapes.slice();
    const index = newShapes.findIndex(s => s.id === selectedId);
    if (index !== -1) {
      const updatedShape = { ...newShapes[index], [key]: value };
      newShapes[index] = { ...newShapes[index], [key]: value };
      setShapes(newShapes);

      // Emit the updated shape to the server
      socket.emit('send-shape', updatedShape);
    }
  };

  const selectedShape = shapes.find(s => s.id === selectedId);

  // --- UI STYLES ---
  const appContainerStyle = { display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' };
  const sidebarStyle = { width: `${sidebarWidth}px`, backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', boxShadow: '2px 0 10px rgba(0,0,0,0.05)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10, overflowY: 'auto' };
  const canvasContainerStyle = { flex: 1, backgroundColor: '#ffffff', position: 'relative' };
  const buttonStyle = { padding: '10px 15px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' };

  return (
    <div style={appContainerStyle}>
      <div style={sidebarStyle}>
        
        <div style={{ marginBottom: '10px', paddingBottom: '15px', borderBottom: '2px dashed #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>🎨 My Canvas</h2>
        </div>

        {/* TOOL SELECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{...buttonStyle, borderColor: mode === 'select' ? '#3b82f6' : '#d1d5db'}} onClick={() => setMode('select')}>🖱️ Pointer</button>
          <button style={{...buttonStyle, borderColor: mode === 'pen' ? '#3b82f6' : '#d1d5db'}} onClick={() => { setMode('pen'); setSelectedId(null); }}>✏️ Drawing mode</button>
          <button style={{...buttonStyle, borderColor: mode === 'eraser' ? '#3b82f6' : '#d1d5db'}} onClick={() => { setMode('eraser'); setSelectedId(null); }}>🧽 Eraser</button>
        </div>

        {/* DYNAMIC SETTINGS AREA */}
        {(mode === 'pen' || mode === 'eraser' || selectedId || selectedTextBoxId) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            
            {/* 1. Brush/Eraser Settings */}
            {(mode === 'pen' || mode === 'eraser') && !selectedId && (
              <>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563' }}>BRUSH SETTINGS</div>
                {mode === 'pen' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px' }}>Color:</label>
                    <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} style={{ width: '100%', height: '30px', cursor: 'pointer', border: 'none' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px' }}>Size: {brushSize}px</label>
                  <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* 2. Shape/Text Style Settings */}
            {selectedId && selectedShape && (
              <>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6' }}>STYLE SETTINGS</div>
                
                {/* Global Fill Color for Shapes & Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px' }}>Fill Color:</label>
                  <input 
                    type="color" 
                    value={selectedShape.fill || '#000000'} 
                    onChange={(e) => updateSelectedShape('fill', e.target.value)}
                    style={{ width: '100%', height: '30px', cursor: 'pointer', border: 'none' }}
                  />
                </div>

    

                {/* Text Specific Options */}
                {selectedShape.type === 'TEXT' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '11px' }}>Font Size:</label>
                      <input 
                        type="number" 
                        value={selectedShape.fontSize} 
                        onChange={(e) => updateSelectedShape('fontSize', parseInt(e.target.value))}
                        style={{ width: '60px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        style={{ padding: '5px 10px', fontWeight: 'bold', border: selectedShape.fontStyle.includes('bold') ? '2px solid #3b82f6' : '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => {
                          const current = selectedShape.fontStyle;
                          updateSelectedShape('fontStyle', current.includes('bold') ? current.replace('bold', '').trim() : `${current} bold`);
                        }}
                      >B</button>
                      <button 
                        style={{ padding: '5px 10px', fontStyle: 'italic', border: selectedShape.fontStyle.includes('italic') ? '2px solid #3b82f6' : '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => {
                          const current = selectedShape.fontStyle;
                          updateSelectedShape('fontStyle', current.includes('italic') ? current.replace('italic', '').trim() : `${current} italic`);
                        }}
                      >I</button>
                      <button 
                        style={{ padding: '5px 10px', textDecoration: 'underline', border: selectedShape.textDecoration === 'underline' ? '2px solid #3b82f6' : '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => updateSelectedShape('textDecoration', selectedShape.textDecoration === 'underline' ? 'none' : 'underline')}
                      >U</button>
                    </div>
                  </div>
                )}

                {/* Outline Options for Shapes */}
                {selectedShape.type !== 'TEXT' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px' }}>Outline:</label>
                      <input 
                        type="checkbox" 
                        checked={(selectedShape.strokeWidth || 0) > 0} 
                        onChange={(e) => updateSelectedShape('strokeWidth', e.target.checked ? 2 : 0)}
                      />
                    </div>
                    {(selectedShape.strokeWidth || 0) > 0 && (
                      <>
                        <input 
                          type="color" 
                          value={selectedShape.stroke || '#000000'} 
                          onChange={(e) => updateSelectedShape('stroke', e.target.value)}
                          style={{ width: '100%', height: '30px', cursor: 'pointer', border: 'none' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px' }}>Outline Width: {selectedShape.strokeWidth}px</label>
                          <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={selectedShape.strokeWidth} 
                            onChange={(e) => updateSelectedShape('strokeWidth', parseInt(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer' }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => {
                    setShapes(shapes.filter(s => s.id !== selectedId));
                    setSelectedId(null);
                  }}
                  style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', justifyContent: 'center', marginTop: '10px' }}
                >
                  🗑️ Delete Selected
                </button>
              </>
            )}

            {/* Text Box Formatting Options */}
            {selectedTextBoxId && textBoxes.find(t => t.id === selectedTextBoxId) && (
              <>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', marginTop: '12px' }}>TEXT BOX FORMATTING</div>
                
                {/* Text Alignment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px' }}>Alignment:</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['left', 'center', 'right', 'justify'].map((align) => (
                      <button
                        key={align}
                        onClick={() => {
                          const updated = textBoxes.map(t =>
                            t.id === selectedTextBoxId ? { ...t, align } : t
                          );
                          setTextBoxes(updated);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px',
                          border: textBoxes.find(t => t.id === selectedTextBoxId)?.align === align ? '2px solid #3b82f6' : '1px solid #ccc',
                          backgroundColor: textBoxes.find(t => t.id === selectedTextBoxId)?.align === align ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '4px',
                        }}
                      >
                        {align === 'left' ? '⬅️' : align === 'center' ? '⬇️' : align === 'right' ? '➡️' : '📄'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete Text Box */}
                <button
                  onClick={() => {
                    setTextBoxes(textBoxes.filter(t => t.id !== selectedTextBoxId));
                    setSelectedTextBoxId(null);
                  }}
                  style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', justifyContent: 'center', marginTop: '8px' }}
                >
                  🗑️ Delete Text Box
                </button>
              </>
            )}
          </div>
        )}

        <hr style={{ width: '100%', borderTop: '1px solid #e5e7eb', margin: '5px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ShapeSelector onSelectShape={handleSelectShape} />
        </div>

        <div style={{ flex: 1 }}></div>

        <button style={{ ...buttonStyle, backgroundColor: '#fee2e2', color: '#ef4444', justifyContent: 'center' }} onClick={handleClearAll}>
          🗑️ Clear All
        </button>

      </div>

      <div style={canvasContainerStyle}>
        <Stage
          width={stageSize.width} height={stageSize.height}
          style={{ cursor: mode === 'pen' ? 'crosshair' : (mode === 'eraser' ? 'cell' : 'default') }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
        >
          <Layer>
            {shapes.map((shape, i) => (
              <ShapeRenderer
                key={shape.id}
                shape={shape}
                isSelected={shape.id === selectedId}
                outlineThickness={outlineThickness}
                onSelect={() => { if(mode === 'select') setSelectedId(shape.id); }}
                onChange={(newAttrs) => {
                  const newShapes = [...shapes];
                  newShapes[i] = newAttrs;
                  setShapes(newShapes);

                  socket.emit('send-shape', newAttrs); // Emit the updated shape to the server
                }}
              />
            ))}

            {mode !== 'select' && (
              <Rect
                id="drawing-overlay"
                x={0}
                y={0}
                width={stageSize.width}
                height={stageSize.height}
                fill="transparent"
              />
            )}

          </Layer>
        </Stage>

        {/* Canvas Text Boxes */}
        {textBoxes.map((box) => (
          <CanvasTextBox
            key={box.id}
            box={box}
            isSelected={box.id === selectedTextBoxId}
            onSelect={(id) => {
              setSelectedTextBoxId(id);
              setSelectedId(null);
            }}
            onUpdate={(updated) => {
              const idx = textBoxes.findIndex(t => t.id === updated.id);
              if (idx !== -1) {
                const newBoxes = [...textBoxes];
                newBoxes[idx] = updated;
                setTextBoxes(newBoxes);
              }
            }}
            onDelete={(id) => {
              setTextBoxes(textBoxes.filter(t => t.id !== id));
              if (selectedTextBoxId === id) setSelectedTextBoxId(null);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;