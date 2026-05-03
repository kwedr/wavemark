import React from 'react';
import { Image as ImageIcon, Download, MousePointer2 } from 'lucide-react';

const ToolSets = [
    {
        name: 'Set 1',
        items: ['一', '二', '三', '四', '五', 'A', 'B', 'C']
    },
    {
        name: 'Set 2',
        items: ['1', '2', '3', '4', '5', 'a', 'b', 'c']
    },
    {
        name: 'Set 3',
        items: ['(1)', '(2)', '(3)', '(4)', '(5)', '(a)', '(b)', '(c)']
    },
    {
        name: 'Set 4',
        items: ['➀', '➁', '➂', '➃', '➄', 'Ⓐ', 'Ⓑ', 'Ⓒ']
    },
    {
        name: 'Set 5',
        items: ['1⃣','2⃣','3⃣','4⃣','5⃣','🄰', '🄱', '🄲']
    }
];

const Toolbar = ({
    activeTool,
    onToolSelect,
    onImport,
    onSave,
    onSaveProject,
    onLoadProject,
    activeColor,
    onColorChange,
    activeFont,
    onFontChange,
    toolSizes,
    onSizeChange
}) => {
    const fonts = [
        'Arial',
        'Times New Roman',
        'Courier New',
        'Georgia',
        'Verdana',
        'Microsoft JhengHei',
        'PingFang TC',
        'Noto Sans TC'
    ];

    return (
        <div style={{
            height: 'var(--toolbar-height)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0 1rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>WaveMark</h1>
            </div>

            <div style={{ width: 1, height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

            {/* Main Actions */}
            <button
                onClick={onImport}
                title="匯入圖片"
                style={{ padding: '8px', color: 'var(--text-secondary)' }}
            >
                <ImageIcon size={20} />
            </button>

            <button
                onClick={onSave}
                title="儲存圖片"
                style={{ padding: '8px', color: 'var(--text-secondary)' }}
            >
                <Download size={20} />
            </button>

            <div style={{ width: 1, height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

            {/* Project Actions */}
            <div style={{ display: 'flex', gap: '4px' }}>
                <button
                    onClick={onSaveProject}
                    title="儲存專案 (JSON)"
                    style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        borderRadius: '4px'
                    }}
                >
                    Save Proj
                </button>
                <button
                    onClick={onLoadProject}
                    title="開啟專案 (JSON)"
                    style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        borderRadius: '4px'
                    }}
                >
                    Load Proj
                </button>
            </div>

            <div style={{ width: 1, height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

            {/* Color and Font Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                    type="color"
                    value={activeColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    title="標記顏色"
                    style={{
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer'
                    }}
                />
                <select
                    value={activeFont}
                    onChange={(e) => onFontChange(e.target.value)}
                    title="選擇字型"
                    style={{
                        padding: '4px',
                        fontSize: '12px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {fonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                    ))}
                </select>
            </div>

            <div style={{ width: 1, height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

            {/* Select Tool */}
            <button
                onClick={() => onToolSelect('select')}
                title="選取 / 移動"
                style={{
                    padding: '8px',
                    borderRadius: '6px',
                    background: activeTool === 'select' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTool === 'select' ? '#fff' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}
            >
                <MousePointer2 size={18} />
            </button>

            <div style={{ width: 1, height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

            {/* Marking Tools */}
            {ToolSets.map((set, setIndex) => {
                const defaultSizes = [39, 20, 17, 17, 17];
                const currentSize = (toolSizes && toolSizes[setIndex] !== undefined) 
                    ? toolSizes[setIndex] 
                    : (defaultSizes[setIndex] || 24);

                return (
                    <div key={setIndex} style={{ display: 'flex', gap: '4px', alignItems: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '8px' }}>
                        {set.items.map((item) => {
                            // Update toolId format to include setIndex: text:{setIndex}:{itemcontent}
                            const toolId = `text:${setIndex}:${item}`;
                            const isActive = activeTool === toolId;

                            return (
                                <button
                                    key={item}
                                    onClick={() => onToolSelect(toolId)}
                                    style={{
                                        width: 'auto',
                                        minWidth: '32px',
                                        height: '32px',
                                        padding: '0 8px',
                                        borderRadius: '4px',
                                        background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                        color: isActive ? '#fff' : 'var(--text-primary)',
                                        fontSize: `${Math.min(currentSize, 24)}px`,
                                        border: isActive ? 'none' : '1px solid var(--border-color)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.1s'
                                    }}
                                >
                                    {item}
                                </button>
                            );
                        })}

                        {/* Size Control for this specific Set */}
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', gap: '4px' }}>
                            <input
                                type="range"
                                min="12"
                                max="72"
                                value={currentSize}
                                onChange={(e) => onSizeChange(setIndex, Number(e.target.value))}
                                title={`${set.name} 字體大小`}
                                style={{ width: '60px' }}
                            />
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '24px' }}>
                                {currentSize}
                            </span>
                        </div>
                    </div>
                );
            })}

        </div>
    );
};

export default Toolbar;
