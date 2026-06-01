import { useRef, useState } from 'react';

interface UserPickerProps {
  members: string[];
  onSelect: (name: string) => void;
  onAddMember: (name: string) => void;
  onDeleteMember: (name: string) => void;
}

export default function UserPicker({ members, onSelect, onAddMember, onDeleteMember }: UserPickerProps) {
  const [showInput, setShowInput] = useState(members.length === 0);
  const [newName, setNewName] = useState('');
  const [longPressing, setLongPressing] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePointerDown(name: string) {
    timerRef.current = setTimeout(() => {
      setLongPressing(null);
      timerRef.current = null;
      if (window.confirm(`确定要删除成员「${name}」吗？该成员的所有植物数据也会被删除。`)) {
        onDeleteMember(name);
      }
    }, 600);
    setLongPressing(name);
  }

  function handlePointerUp() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLongPressing(null);
  }

  return (
    <section className="page-stack">
      <div className="hero-card">
        <p className="eyebrow">🌻 欢迎来到</p>
        <h1>花园管家</h1>
        <p style={{ margin: '12px 0 0', color: '#64745f' }}>
          {showInput ? '给自己起个昵称吧' : '选择你的名字进入小花园'}
        </p>
        {members.length > 0 && !showInput && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b58a7a' }}>
            轻点进入 · 长按删除
          </p>
        )}
      </div>

      {members.length > 0 && !showInput && (
        <>
          <div className="member-grid">
            {members.map((name) => (
              <button
                key={name}
                className={`member-card${longPressing === name ? ' long-pressing' : ''}`}
                type="button"
                onClick={() => onSelect(name)}
                onPointerDown={() => handlePointerDown(name)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <span className="member-avatar" aria-hidden="true">🌻</span>
                <strong>{name}</strong>
              </button>
            ))}
          </div>
          <button className="secondary-button" type="button" onClick={() => setShowInput(true)} style={{ width: '100%' }}>
            + 添加新成员
          </button>
        </>
      )}

      {showInput && (
        <form className="sheet-card form-stack" onSubmit={(e) => {
          e.preventDefault();
          const trimmed = newName.trim();
          if (trimmed && !members.includes(trimmed)) {
            onAddMember(trimmed);
            onSelect(trimmed);
          }
        }}>
          <label>
            你的昵称
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入昵称"
              autoFocus
            />
          </label>
          <div className="button-row">
            {members.length > 0 && (
              <button className="secondary-button" type="button" onClick={() => setShowInput(false)}>返回</button>
            )}
            <button className="primary-button" type="submit" disabled={!newName.trim()}>确定</button>
          </div>
        </form>
      )}
    </section>
  );
}