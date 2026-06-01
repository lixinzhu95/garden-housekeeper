import { useEffect, useMemo, useState } from 'react';
import PlantArchive from './components/PlantArchive';
import PlantDetail from './components/PlantDetail';
import PlantForm from './components/PlantForm';
import TaskBoard from './components/TaskBoard';
import UserPicker from './components/UserPicker';
import { countTodayTasks, getTasksByGroup } from './domain/careTasks';
import { todayString } from './domain/dates';
import { createPlant, deleteCareLog, deletePlant, recordCare, updatePlant } from './domain/plantActions';
import {
  getCurrentUser,
  getMemberList,
  loadPlants,
  saveMemberList,
  savePlants,
  setCurrentUser,
  syncFromServer,
} from './domain/storage';
import type { CareTaskGroup, CareType, Plant, PlantFormValues, View } from './domain/types';

type Modal = 'none' | 'add' | 'edit';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<string | null>(getCurrentUser);
  const [members, setMembers] = useState<string[]>(() => {
    const list = getMemberList();
    return list.length > 0 ? list : ['妈妈', '爸爸', '我'];
  });
  const [plants, setPlants] = useState<Plant[]>(() =>
    currentUser ? loadPlants() : [],
  );
  const [view, setView] = useState<View>('tasks');
  const [selectedGroup, setSelectedGroup] = useState<CareTaskGroup>('today');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>('none');
  const today = todayString();

  useEffect(() => {
    if (currentUser) {
      syncFromServer(currentUser).then((serverData) => {
        if (serverData) setPlants(serverData);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      savePlants(plants);
    }
  }, [plants, currentUser]);

  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId) ?? null;
  const currentTasks = useMemo(
    () => getTasksByGroup(plants, today, selectedGroup),
    [plants, selectedGroup, today],
  );
  const todayCount = useMemo(() => countTodayTasks(plants, today), [plants, today]);

  function handleSelectUser(name: string) {
    setCurrentUser(name);
    setCurrentUserState(name);
    setView('tasks');
    setModal('none');
  }

  function handleAddMember(name: string) {
    const updated = [...members, name];
    setMembers(updated);
    saveMemberList(updated);
  }

  function handleSwitchUser() {
    setCurrentUser(null);
    setCurrentUserState(null);
    setPlants([]);
  }

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

  function handleDeletePlant(plantId: string) {
    if (!window.confirm('确定要删除这盆植物吗？相关的养护记录也会被删除。')) return;
    setPlants((currentPlants) => deletePlant(currentPlants, plantId));
    setView('archive');
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

  if (!currentUser) {
    return (
      <main className="app-shell">
        <UserPicker members={members} onSelect={handleSelectUser} onAddMember={handleAddMember} />
      </main>
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
          onDelete={handleDeletePlant}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 14, color: '#72806a' }}>
          🌱 {currentUser} 的小花园
        </span>
        <button className="ghost-button" type="button" onClick={handleSwitchUser} style={{ minHeight: 32, padding: '4px 12px', fontSize: 13 }}>
          切换成员
        </button>
      </div>

      <div className="view-content" key={`${view}-${modal}-${selectedPlantId ?? 'none'}`}>
        {renderContent()}
      </div>

      <nav className="bottom-nav" aria-label="主导航">
        <button
          type="button"
          className={view === 'tasks' && modal === 'none' ? 'nav-button active' : 'nav-button'}
          onClick={() => { setView('tasks'); setModal('none'); }}
        >
          今日照顾
        </button>
        <button
          type="button"
          className={view === 'archive' && modal === 'none' ? 'nav-button active' : 'nav-button'}
          onClick={() => { setView('archive'); setModal('none'); }}
        >
          花草档案
        </button>
      </nav>
    </main>
  );
}