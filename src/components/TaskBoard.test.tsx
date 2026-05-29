import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskBoard from '../components/TaskBoard';
import type { CareTask, CareTaskGroup, CareType } from '../domain/types';

const noop = () => {};

const mockTask = (overrides: Partial<CareTask> = {}): CareTask => ({
  id: 'task-1',
  plantId: 'plant-1',
  plantName: '绿萝',
  type: 'watering' as CareType,
  dueDate: '2024-01-01',
  group: 'today' as CareTaskGroup,
  ...overrides,
});

describe('TaskBoard', () => {
  describe('ARIA tab pattern', () => {
    it('renders tablist with correct aria-label', () => {
      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={1}
          selectedGroup="today"
          tasks={[mockTask()]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      expect(screen.getByRole('tablist', { name: '任务分组' })).toBeInTheDocument();
    });

    it('renders tab buttons with correct role', () => {
      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={1}
          selectedGroup="today"
          tasks={[mockTask()]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
      expect(tabs[0]).toHaveAttribute('id', 'task-tab-overdue');
      expect(tabs[1]).toHaveAttribute('id', 'task-tab-today');
      expect(tabs[2]).toHaveAttribute('id', 'task-tab-next3days');
    });

    it('sets aria-selected true on active tab', () => {
      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={1}
          selectedGroup="today"
          tasks={[mockTask()]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      expect(screen.getByRole('tab', { name: '今天' })).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-selected false on inactive tabs', () => {
      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={1}
          selectedGroup="today"
          tasks={[mockTask()]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      expect(screen.getByRole('tab', { name: '逾期' })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tab', { name: '未来 3 天' })).toHaveAttribute('aria-selected', 'false');
    });

    it('renders tabpanel with correct id and aria-labelledby', () => {
      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={1}
          selectedGroup="today"
          tasks={[mockTask()]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('id', 'task-panel-today');
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'task-tab-today');
    });

    it('updates tabpanel id when selectedGroup changes', () => {
      const { rerender } = render(
        <TaskBoard
          today="2024-01-01"
          todayCount={0}
          selectedGroup="today"
          tasks={[]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'task-panel-today');

      rerender(
        <TaskBoard
          today="2024-01-01"
          todayCount={0}
          selectedGroup="overdue"
          tasks={[]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'task-panel-overdue');
    });

    it('tab buttons have aria-controls pointing to panel ids', () => {
      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={1}
          selectedGroup="today"
          tasks={[mockTask()]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      const overdueTab = screen.getByRole('tab', { name: '逾期' });
      const todayTab = screen.getByRole('tab', { name: '今天' });
      const next3daysTab = screen.getByRole('tab', { name: '未来 3 天' });

      expect(overdueTab).toHaveAttribute('aria-controls', 'task-panel-overdue');
      expect(todayTab).toHaveAttribute('aria-controls', 'task-panel-today');
      expect(next3daysTab).toHaveAttribute('aria-controls', 'task-panel-next3days');
    });
  });

  describe('tab interaction', () => {
    it('calls onGroupChange when a tab is clicked', async () => {
      const onGroupChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={0}
          selectedGroup="today"
          tasks={[]}
          hasPlants={true}
          onGroupChange={onGroupChange}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      await user.click(screen.getByRole('tab', { name: '逾期' }));
      expect(onGroupChange).toHaveBeenCalledWith('overdue');
    });

    it('calls onGroupChange with correct group value for each tab', async () => {
      const onGroupChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={0}
          selectedGroup="today"
          tasks={[]}
          hasPlants={true}
          onGroupChange={onGroupChange}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      await user.click(screen.getByRole('tab', { name: '逾期' }));
      expect(onGroupChange).toHaveBeenLastCalledWith('overdue');

      await user.click(screen.getByRole('tab', { name: '未来 3 天' }));
      expect(onGroupChange).toHaveBeenLastCalledWith('next3days');
    });
  });

  describe('decorative emoji', () => {
    it('has aria-hidden on task icons', () => {
      render(
        <TaskBoard
          today="2024-01-01"
          todayCount={1}
          selectedGroup="today"
          tasks={[mockTask({ type: 'watering' }), mockTask({ id: 'task-2', type: 'fertilizing', plantId: 'plant-2' })]}
          hasPlants={true}
          onGroupChange={noop}
          onComplete={noop}
          onOpenPlant={noop}
          onAddPlant={noop}
        />
      );

      const icons = screen.getAllByText((_, element) => element?.tagName === 'SPAN' && element.classList.contains('task-icon'));
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
