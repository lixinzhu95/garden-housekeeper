import { compareDateOnly, daysBetween } from './dates';
import type { CareTask, CareTaskGroup, CareType, Plant } from './types';

function getGroup(dueDate: string, today: string): CareTaskGroup | null {
  const comparison = compareDateOnly(dueDate, today);

  if (comparison < 0) return 'overdue';
  if (comparison === 0) return 'today';

  const daysUntilDue = daysBetween(today, dueDate);
  return daysUntilDue <= 3 ? 'next3days' : null;
}

function createTask(plant: Plant, type: CareType, dueDate: string, today: string): CareTask | null {
  const group = getGroup(dueDate, today);
  if (!group) return null;

  return {
    id: `${plant.id}-${type}`,
    plantId: plant.id,
    plantName: plant.name,
    plantImage: plant.image,
    type,
    dueDate,
    group,
  };
}

export function getCareTasks(plants: Plant[], today: string): CareTask[] {
  return plants
    .flatMap((plant) => {
      const tasks: Array<CareTask | null> = [
        createTask(plant, 'watering', plant.nextWateringDate, today),
      ];

      if (plant.nextFertilizingDate) {
        tasks.push(createTask(plant, 'fertilizing', plant.nextFertilizingDate, today));
      }

      return tasks.filter((task): task is CareTask => task !== null);
    })
    .sort((left, right) => {
      const dateComparison = compareDateOnly(left.dueDate, right.dueDate);
      if (dateComparison !== 0) return dateComparison;
      return left.plantName.localeCompare(right.plantName, 'zh-CN');
    });
}

export function getTasksByGroup(plants: Plant[], today: string, group: CareTaskGroup): CareTask[] {
  return getCareTasks(plants, today).filter((task) => task.group === group);
}

export function countTodayTasks(plants: Plant[], today: string): number {
  return getTasksByGroup(plants, today, 'today').length;
}
