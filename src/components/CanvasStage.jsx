import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Group, Rect } from 'react-konva';
import useImage from 'use-image';

const CanvasStage = forwardRef(({
    width,
    height,
    backgroundUrl,
    layers,
    onLayerChange,
    selectedTool,
    onStageClick,
    selectedItem,
    onSelectItem,
    onUpdateItemContent
}, ref) => {
    const stageRef = useRef(null);
    const [image] = useImage(backgroundUrl);
    const [editingItem, setEditingItem] = React.useState(null); // { layerId, index, text, x, y, fontSize }
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getStage: () => stageRef.current
    }));

    const handleDragEnd = (e, layerId, itemIndex) => {
        const newLayers = layers.map(layer => {
            if (layer.id === layerId) {
                const newItems = [...layer.items];
                newItems[itemIndex] = {
                    ...newItems[itemIndex],
                    x: e.target.x(),
                    y: e.target.y()
                };
                return { ...layer, items: newItems };
            }
            return layer;
        });
        onLayerChange(newLayers);
    };

    const handleStageClickInternal = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            // specific logic if needed, or pass to parent
            const pos = e.target.getStage().getPointerPosition();
            onStageClick(pos);
            // Deselect item if clicking on empty stage
            if (selectedItem) {
                onSelectItem(null);
            }
            setEditingItem(null);
        }
    };

    const handleTextDblClick = (e, layerId, itemIndex, item) => {
        const absPos = e.target.getAbsolutePosition();
        const stageBox = stageRef.current.getStage().container().getBoundingClientRect();

        setEditingItem({
            layerId,
            index: itemIndex,
            text: item.content,
            x: absPos.x + stageBox.left,
            y: absPos.y + stageBox.top,
            fontSize: item.fontSize || 24,
            fill: item.fill || 'red'
        });
    };

    const handleInputConfirm = () => {
        if (editingItem) {
            onUpdateItemContent(editingItem.layerId, editingItem.index, editingItem.text);
            setEditingItem(null);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputConfirm();
        } else if (e.key === 'Escape') {
            setEditingItem(null);
        }
    };

    useEffect(() => {
        if (editingItem && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingItem]);

    return (
        <div style={{ backgroundColor: '#0f172a', width, height }}>
            <Stage
                width={width}
                height={height}
                ref={stageRef}
                onClick={handleStageClickInternal}
                onTap={handleStageClickInternal} // for mobile
            >
                <Layer>
                    {/* Background Image Layer */}
                    {image && (
                        <KonvaImage
                            image={image}
                            width={width} // You might want to scale this properly
                            height={height}
                            fit="contain"
                            listening={false} // Don't intercept clicks so we can place items on top?
                        // Actually we might want to click background to deselect.
                        />
                    )}
                    {!image && (
                        <Text
                            text="拖曳或匯入圖片開始"
                            x={width / 2 - 100}
                            y={height / 2}
                            fontSize={20}
                            fill="#94a3b8"
                            listening={false}
                        />
                    )}
                </Layer>

                {/* User Layers */}
                {layers.filter(l => l.visible).map((layer) => (
                    <Layer key={layer.id} opacity={layer.locked ? 0.7 : 1} listening={!layer.locked}>
                        {layer.items.map((item, i) => {
                            const isSelected = selectedItem && selectedItem.layerId === layer.id && selectedItem.index === i;
                            return (
                                <Group
                                    key={i}
                                    x={item.x}
                                    y={item.y}
                                    draggable={!layer.locked && (selectedTool === 'select' || isSelected)}
                                    onDragEnd={(e) => handleDragEnd(e, layer.id, i)}
                                    onClick={(e) => {
                                        e.cancelBubble = true;
                                        onSelectItem({ layerId: layer.id, index: i });
                                    }}
                                    onTap={(e) => {
                                        e.cancelBubble = true;
                                        onSelectItem({ layerId: layer.id, index: i });
                                    }}
                                    onDblClick={(e) => {
                                        e.cancelBubble = true;
                                        handleTextDblClick(e, layer.id, i, item);
                                    }}
                                    onDblTap={(e) => {
                                        e.cancelBubble = true;
                                        handleTextDblClick(e, layer.id, i, item);
                                    }}
                                >
                                    {/* Text content */}
                                    {item.type === 'text' && (
                                        <Text
                                            text={item.content}
                                            fontSize={item.fontSize || 24}
                                            fill={item.fill || 'red'}
                                            fontStyle="bold"
                                            fontFamily="Arial"
                                            shadowColor="black"
                                            shadowBlur={2}
                                            shadowOpacity={0.5}
                                            shadowOffset={{ x: 1, y: 1 }}
                                        />
                                    )}

                                    {/* Selection Highlight (Simple Box) */}
                                    {isSelected && (
                                        <Rect
                                            width={(item.fontSize || 24) * (item.content.length > 1 ? item.content.length : 1.2)}
                                            height={(item.fontSize || 24)}
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dash={[5, 5]}
                                            listening={false} // pass through touches?
                                            offsetX={0}
                                            offsetY={-2} // minor adjustment
                                        />
                                    )}
                                </Group>
                            );
                        })}
                    </Layer>
                ))}
            </Stage>

            {editingItem && (
                <input
                    ref={inputRef}
                    value={editingItem.text}
                    onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                    onBlur={handleInputConfirm}
                    onKeyDown={handleInputKeyDown}
                    style={{
                        position: 'fixed',
                        top: editingItem.y,
                        left: editingItem.x,
                        fontSize: `${editingItem.fontSize}px`,
                        color: editingItem.fill,
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid #3b82f6',
                        borderRadius: '4px',
                        outline: 'none',
                        padding: '2px 4px',
                        zIndex: 1000,
                        fontFamily: 'Arial',
                        fontWeight: 'bold'
                    }}
                />
            )}
        </div>
    );
});

export default CanvasStage;
