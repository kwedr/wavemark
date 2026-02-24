import { useState, useRef, useEffect } from 'react'
import './index.css'
import Toolbar from './components/Toolbar'
import LayerPanel from './components/LayerPanel'
import CanvasStage from './components/CanvasStage'

function App() {
  const [layers, setLayers] = useState([
    { id: 'layer-1', name: '圖層 1', visible: true, locked: false, items: [] }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');
  const [activeTool, setActiveTool] = useState('select');
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);

  const [activeColor, setActiveColor] = useState('#ef4444'); // Default red

  // Replace single activeSize with toolSizes array [set1, set2, set3]
  const [toolSizes, setToolSizes] = useState([39, 20, 17]);

  const [selectedItem, setSelectedItem] = useState(null); // { layerId, index }

  useEffect(() => {
    // Resize observer or initial fit
    if (containerRef.current) {
      setStageSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Removed old useEffect for keydown in favor of onKeyDown prop on container

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    const newLayer = {
      id: newId,
      name: `圖層 ${layers.length + 1}`,
      visible: true,
      locked: false,
      items: []
    };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newId);
  };

  const handleDeleteLayer = (id) => {
    if (layers.length <= 1) return; // Prevent deleting last layer
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    if (activeLayerId === id) {
      setActiveLayerId(newLayers[0].id);
    }
  };

  const handleUpdateLayer = (id, basicAttrs) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...basicAttrs } : l));
  };

  // Center placement adjustment
  const handleStageClick = (pos) => {
    // If clicking on empty stage with select tool, deselect
    if (activeTool === 'select') {
      setSelectedItem(null);
      return;
    }

    if (!activeTool.startsWith('text:')) return;

    // Extract toolSetIndex from activeTool (e.g., text:0:A -> setIndex=0, content=A)
    // Update activeTool format to `text:${setIndex}:${item}` in Toolbar.jsx later
    const parts = activeTool.split(':');
    const setIndex = parseInt(parts[1], 10);
    const textContent = parts[2];
    const activeLayer = layers.find(l => l.id === activeLayerId);

    // Get specific size for this toolset
    const currentSize = toolSizes[setIndex] || [39, 20, 17][setIndex] || 24;
    // Estimate center offset (very rough, assuming square-ish for single chars)
    const offset = currentSize / 2;

    if (activeLayer && !activeLayer.locked && activeLayer.visible) {
      const newItem = {
        type: 'text',
        content: textContent,
        x: pos.x - offset, // Center X
        y: pos.y - offset, // Center Y
        fill: activeColor,
        fontSize: currentSize,
        toolSetIndex: setIndex
      };

      const newLayers = layers.map(l => {
        if (l.id === activeLayerId) {
          return { ...l, items: [...l.items, newItem] };
        }
        return l;
      });

      setLayers(newLayers);
      // Select the newly added item? Maybe not required, but good UX.
      // For now let's just place it.
    }
  };

  const stageRef = useRef(null);

  const handleSave = () => {
    if (stageRef.current) {
      // Deselect before saving to avoid capturing selection web (if implemented)
      setSelectedItem(null);
      // Need a small timeout to allow render to update? 
      // Or just force it. react-konva updates are usually sync-ish with state but 
      // stage.toDataURL inside same tick might be risky if we just set state.
      // Let's rely on user deselecting or just not render selection decoration in export.
      setTimeout(() => {
        if (!stageRef.current) return;
        const uri = stageRef.current.getStage().toDataURL();
        const link = document.createElement('a');
        link.download = `wavemark-${Date.now()}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 0);
    }
  };

  const handleProjectSave = () => {
    const projectData = {
      layers: layers,
      backgroundUrl: backgroundUrl,
      stageSize: stageSize,
      activeLayerId: activeLayerId,
      activeTool: activeTool,
      activeColor: activeColor,
      toolSizes: toolSizes, // Save the new array instead of single size
      activeSize: toolSizes[0], // Keep for backwards compatibility if needed
    };
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `wavemark-project-${Date.now()}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProjectLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target.result);
          setLayers(projectData.layers || []);
          setBackgroundUrl(projectData.backgroundUrl || null);
          setStageSize(projectData.stageSize || { width: 800, height: 600 });
          setActiveLayerId(projectData.activeLayerId || (projectData.layers && projectData.layers[0] ? projectData.layers[0].id : ''));
          setActiveTool(projectData.activeTool || 'select');
          setActiveColor(projectData.activeColor || '#ef4444');
          if (projectData.toolSizes) {
            setToolSizes(projectData.toolSizes);
          } else if (projectData.activeSize) {
            // Backward compatibility for old projects
            setToolSizes([projectData.activeSize, projectData.activeSize, projectData.activeSize]);
          } else {
            setToolSizes([39, 20, 17]);
          }
        } catch (error) {
          console.error("Failed to parse project file:", error);
          alert("Failed to load project. Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger delete if user is typing in an input or textarea
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem) {
        setLayers(currentLayers => {
          return currentLayers.map(l => {
            if (l.id === selectedItem.layerId) {
              const newItems = [...l.items];
              if (selectedItem.index >= 0 && selectedItem.index < newItems.length) {
                newItems.splice(selectedItem.index, 1);
              }
              return { ...l, items: newItems };
            }
            return l;
          });
        });
        setSelectedItem(null);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedItem]);

  const handleUpdateItemContent = (layerId, index, newContent) => {
    setLayers(currentLayers => currentLayers.map(l => {
      if (l.id === layerId) {
        const newItems = [...l.items];
        newItems[index] = { ...newItems[index], content: newContent };
        return { ...l, items: newItems };
      }
      return l;
    }));
  };

  const handleSizeChange = (setIndex, newSize) => {
    setToolSizes(prevSizes => {
      const newSizes = [...prevSizes];
      newSizes[setIndex] = newSize;
      return newSizes;
    });

    // Sync all text items in ALL layers that belong to this toolSetIndex to the same size
    // Using this approach makes "same block same size" global across the layer/project for that specific type
    // If you only want activeLayer, we can restrict it. Let's do ALL layers for consistency.
    setLayers(currentLayers => currentLayers.map(l => {
      const newItems = l.items.map(item => {
        if (item.type === 'text' && item.toolSetIndex === setIndex) {
          return { ...item, fontSize: newSize };
        }
        return item;
      });
      return { ...l, items: newItems };
    }));
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', outline: 'none' }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      {/* Input for loading project file */}
      <input
        type="file"
        id="projectFileInput"
        onChange={handleProjectLoad}
        style={{ display: 'none' }}
        accept=".json"
      />

      <Toolbar
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        onImport={handleImport}
        onSave={handleSave}
        onSaveProject={handleProjectSave}
        onLoadProject={() => document.getElementById('projectFileInput').click()}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        toolSizes={toolSizes}
        onSizeChange={handleSizeChange}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LayerPanel
          layers={layers}
          activeLayerId={activeLayerId}
          onLayerSelect={setActiveLayerId}
          onLayerAdd={handleAddLayer}
          onLayerDelete={handleDeleteLayer}
          onLayerUpdate={handleUpdateLayer}
        />

        <div
          ref={containerRef}
          style={{ flex: 1, position: 'relative', background: '#0f172a', overflow: 'hidden' }}
        >
          <CanvasStage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            backgroundUrl={backgroundUrl}
            layers={layers}
            onLayerChange={setLayers}
            selectedTool={activeTool}
            onStageClick={handleStageClick}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            onUpdateItemContent={handleUpdateItemContent}
          />
        </div>
      </div>
    </div>
  )
}

export default App
