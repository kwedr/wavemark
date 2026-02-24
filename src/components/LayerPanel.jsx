import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, Plus } from 'lucide-react';

const LayerPanel = ({ layers, activeLayerId, onLayerSelect, onLayerUpdate, onLayerAdd, onLayerDelete }) => {
    return (
        <div style={{
            width: 'var(--sidebar-width)',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>圖層</h3>
                <button
                    onClick={onLayerAdd}
                    style={{ padding: '4px', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                    <Plus size={16} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {layers.slice().reverse().map((layer) => (
                    <div
                        key={layer.id}
                        onClick={() => onLayerSelect(layer.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            marginBottom: '4px',
                            borderRadius: '6px',
                            background: activeLayerId === layer.id ? 'var(--bg-tertiary)' : 'transparent',
                            cursor: 'pointer',
                            border: activeLayerId === layer.id ? '1px solid var(--accent-primary)' : '1px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                            <button onClick={(e) => { e.stopPropagation(); onLayerUpdate(layer.id, { visible: !layer.visible }); }}>
                                {layer.visible ? <Eye size={14} color="#94a3b8" /> : <EyeOff size={14} color="#64748b" />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onLayerUpdate(layer.id, { locked: !layer.locked }); }}>
                                {layer.locked ? <Lock size={14} color="#94a3b8" /> : <Unlock size={14} color="#64748b" />}
                            </button>
                        </div>

                        <span style={{ fontSize: '0.9rem', flex: 1, userSelect: 'none' }}>{layer.name}</span>

                        <button
                            onClick={(e) => { e.stopPropagation(); onLayerDelete(layer.id); }}
                            style={{ opacity: 0.5 }}
                            onMouseEnter={(e) => e.target.style.opacity = 1}
                            onMouseLeave={(e) => e.target.style.opacity = 0.5}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerPanel;
