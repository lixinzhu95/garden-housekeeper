import { useState } from 'react';

interface UserPickerProps {
  members: string[];
  onSelect: (name: string) => void;
  onAddMember: (name: string) => void;
}

export default function UserPicker({ members, onSelect, onAddMember }: UserPickerProps) {
  const [newName, setNewName] = useState('');

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed || members.includes(trimmed)) return;
    onAddMember(trimmed);
    setNewName('');
  }

  return (
    <section className="page-stack">
      <div className="hero-card">
        <p className="eyebrow">🌻 欢迎来到</p>
        <h1>花园管家</h1>
        <p style={{ margin: '12px 0 0', color: '#64745f' }}>选择你的名字进入小花园</p>
      </div>

      {members.length > 0 && (
        <div className="member-grid">
          {members.map((name) => (
            <button key={name} className="member-card" type="button" onClick={() => onSelect(name)}>
              <span className="member-avatar" aria-hidden="true">
                {name === '妈妈' ? '🌸' : name === '爸爸' ? '🌿' : name === '我' ? '🌱' : '🌻'}
              </span>
              <strong>{name}</strong>
            </button>
          ))}
        </div>
      )}

      <div className="sheet-card form-stack" style={{ padding: '18px' }}>
        <label>
          添加新成员
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="输入名字"
              style={{ flex: 1 }}
            />
            <button className="primary-button" type="button" onClick={handleAdd} disabled={!newName.trim()}>
              添加
            </button>
          </div>
        </label>
      </div>
    </section>
  );
}