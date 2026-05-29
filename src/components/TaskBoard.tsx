import { useCallback, useRef, useState } from 'react';
import { getTaskDateLabel } from '../domain/dates';
import type { CareTask, CareTaskGroup, CareType } from '../domain/types';

interface TaskBoardProps {
  today: string;
  todayCount: number;
  selectedGroup: CareTaskGroup;
  tasks: CareTask[];
  hasPlants: boolean;
  onGroupChange: (group: CareTaskGroup) => void;
  onComplete: (plantId: string, type: CareType) => void;
  onOpenPlant: (plantId: string) => void;
  onAddPlant: () => void;
}

const groups: Array<{ value: CareTaskGroup; label: string }> = [
  { value: 'overdue', label: '逾期' },
  { value: 'today', label: '今天' },
  { value: 'next3days', label: '未来 3 天' },
];

const careLabels: Record<CareType, string> = {
  watering: '浇水',
  fertilizing: '施肥',
};

export default function TaskBoard({
  today,
  todayCount,
  selectedGroup,
  tasks,
  hasPlants,
  onGroupChange,
  onComplete,
  onOpenPlant,
  onAddPlant,
}: TaskBoardProps) {
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleComplete = useCallback(
    (taskId: string, plantId: string, type: CareType) => {
      if (timersRef.current.has(taskId)) return;
      setCompletingIds((prev) => new Set(prev).add(taskId));

      const timer = setTimeout(() => {
        timersRef.current.delete(taskId);
        onComplete(plantId, type);
      }, 600);
      timersRef.current.set(taskId, timer);
    },
    [onComplete],
  );

  return (
    <section className="page-stack">
      <div className="hero-card">
        <p className="eyebrow">今日照顾</p>
        <h1>{todayCount > 0 ? `今天有 ${todayCount} 件养护小事` : '今天的小花园很安稳'}</h1>
      </div>

      <div className="tab-row" role="tablist" aria-label="任务分组">
        {groups.map((group) => (
          <button
            key={group.value}
            type="button"
            role="tab"
            id={`task-tab-${group.value}`}
            aria-selected={group.value === selectedGroup}
            aria-controls={`task-panel-${group.value}`}
            className={group.value === selectedGroup ? 'tab-button active' : 'tab-button'}
            onClick={() => onGroupChange(group.value)}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="page-stack" role="tabpanel" id={`task-panel-${selectedGroup}`} aria-labelledby={`task-tab-${selectedGroup}`}>
        {!hasPlants ? (
          <div className="empty-card">
            <p>🌱 先添加第一盆花吧</p>
            <button className="primary-button" type="button" onClick={onAddPlant}>新增花草</button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-card">🌼 这几天它们都还好</div>
        ) : (
          tasks.map((task) => {
            const completing = completingIds.has(task.id);
            return (
              <article
                key={task.id}
                className={`task-card${task.group === 'overdue' ? ' overdue' : ''}`}
              >
                <button className="task-main" type="button" onClick={() => onOpenPlant(task.plantId)}>
                  <span className="task-icon" aria-hidden="true">{task.type === 'watering' ? '💧' : '🌿'}</span>
                  <span>
                    <strong>{task.plantName}</strong>
                    <small>{careLabels[task.type]} · {getTaskDateLabel(task.dueDate, today)}</small>
                  </span>
                </button>
                <button
                  className={`primary-button${completing ? ' completing' : ''}`}
                  type="button"
                  disabled={completing}
                  onClick={() => handleComplete(task.id, task.plantId, task.type)}
                >
                  {completing ? `✓ 已${careLabels[task.type]}` : careLabels[task.type]}
                </button>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
