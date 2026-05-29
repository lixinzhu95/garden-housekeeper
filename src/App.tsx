import { useEffect, useMemo, useState } from 'react';
import PlantArchive from './components/PlantArchive';
import PlantDetail from './components/PlantDetail';
import PlantForm from './components/PlantForm';
import TaskBoard from './components/TaskBoard';
import { countTodayTasks, getTasksByGroup } from './domain/careTasks';
import { todayString } from './domain/dates';
import { createPlant, deleteCareLog, recordCare, updatePlant } from './domain/plantActions';
import { createDemoData } from './domain/seedData';
import { loadPlants, savePlants } from './domain/storage';
import type { CareTaskGroup, CareType, Plant, PlantFormValues, View } from './domain/types';

type Modal = 'none' | 'add' | 'edit';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>(() => {
    const stored = loadPlants();
    if (import.meta.env.MODE === 'test') return stored;
    const demo = createDemoData();
    const seen = new Set(demo.map((p) => p.id));
    const merged = [...demo, ...stored.filter((p) => !seen.has(p.id))];
    savePlants(merged);
    return merged;
  });
  const [view, setView] = useState<View>('tasks');
  const [selectedGroup, setSelectedGroup] = useState<CareTaskGroup>('today');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>('none');
  const today = todayString();

  useEffect(() => {
    savePlants(plants);
  }, [plants]);

  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId) ?? null;
  const currentTasks = useMemo(
    () => getTasksByGroup(plants, today, selectedGroup),
    [plants, selectedGroup, today],
  );
  const todayCount = useMemo(() => countTodayTasks(plants, today), [plants, today]);

  function openPlant(plantId: string) {
    setSelectedPlantId(plantId);
    setView('detail');
    setModal('none');
  }

  function openAddForm() {
    setModal('add');
  }

  function openEditForm() {
    setModal('edit');
  }

  function closeForm() {
    setModal('none');
  }

  function handleCreatePlant(values: PlantFormValues) {
    setPlants((currentPlants) => [...currentPlants, createPlant(values, today)]);
    setModal('none');
    setView('archive');
  }

  function handleUpdatePlant(values: PlantFormValues) {
    if (!selectedPlant) return;

    setPlants((currentPlants) =>
      currentPlants.map((plant) => (plant.id === selectedPlant.id ? updatePlant(plant, values, today) : plant)),
    );
    setModal('none');
  }

  function handleDeleteCareLog(plantId: string, logId: string) {
    setPlants((currentPlants) =>
      currentPlants.map((plant) => (plant.id === plantId ? deleteCareLog(plant, logId) : plant)),
    );
  }

  function handleRecordCare(plantId: string, type: CareType) {
    setPlants((currentPlants) =>
      currentPlants.map((currentPlant) =>
        currentPlant.id === plantId ? recordCare(currentPlant, type, today) : currentPlant,
      ),
    );
  }

  function renderContent() {
    if (modal === 'add') {
      return <PlantForm onSubmit={handleCreatePlant} onCancel={closeForm} />;
    }

    if (modal === 'edit' && selectedPlant) {
      return <PlantForm plant={selectedPlant} onSubmit={handleUpdatePlant} onCancel={closeForm} />;
    }

    if (view === 'archive') {
      return <PlantArchive plants={plants} onAddPlant={openAddForm} onOpenPlant={openPlant} />;
    }

    if (view === 'detail' && selectedPlant) {
      return (
        <PlantDetail
          plant={selectedPlant}
          onBack={() => setView('archive')}
          onEdit={openEditForm}
          onRecordCare={handleRecordCare}
          onDeleteCareLog={handleDeleteCareLog}
        />
      );
    }

    return (
      <TaskBoard
        today={today}
        todayCount={todayCount}
        selectedGroup={selectedGroup}
        tasks={currentTasks}
        hasPlants={plants.length > 0}
        onGroupChange={setSelectedGroup}
        onComplete={handleRecordCare}
        onOpenPlant={openPlant}
        onAddPlant={openAddForm}
      />
    );
  }

  return (
    <main className="app-shell">
      <div className="view-content" key={`${view}-${modal}-${selectedPlantId ?? 'none'}`}>
        {renderContent()}
      </div>

      <nav className="bottom-nav" aria-label="主导航">
        <button
          type="button"
          className={view === 'tasks' && modal === 'none' ? 'nav-button active' : 'nav-button'}
          onClick={() => {
            setView('tasks');
            setModal('none');
          }}
        >
          今日照顾
        </button>
        <button
          type="button"
          className={view === 'archive' && modal === 'none' ? 'nav-button active' : 'nav-button'}
          onClick={() => {
            setView('archive');
            setModal('none');
          }}
        >
          花草档案
        </button>
      </nav>
    </main>
  );
}
