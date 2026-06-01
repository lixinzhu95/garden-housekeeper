import { useEffect, useMemo, useRef, useState } from 'react';
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
    if (!localStorage.getItem('garden-housekeeper-migrated')) {
      localStorage.removeItem('garden-housekeeper-members');
      localStorage.setItem('garden-housekeeper-migrated', '1');
      return [];
    }
    return getMemberList();
  });
  const [plants, setPlants] = useState<Plant[]>(() =>
    currentUser ? loadPlants() : [],
  );
  const [view, setView] = useState<View>('tasks');
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CareTaskGroup>('today');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>('none');
  const today = todayString();

  // Persist plants to localStorage + server
  function persist(updated: Plant[]) {
    if (!currentUser) return;
    savePlants(updated);
  }

  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId) ?? null;
  const currentTasks = useMemo(
    () => getTasksByGroup(plants, today, selectedGroup),
    [plants, selectedGroup, today],
  );
  const todayCount = useMemo(() => countTodayTasks(plants, today), [plants, today]);

  function handleSelectUser(name: string) {
    setCurrentUser(name);
    setCurrentUserState(name);
    if (!members.includes(name)) {
      const updated = [...members, name];
      setMembers(updated);
      saveMemberList(updated);
    }
    // Load data synchronously before React re-renders
    const localData = loadPlants();
    setPlants(localData.length > 0 ? localData : []);
    // Sync from server in background (if server has more data)
    if (localData.length === 0) {
      syncFromServer(name).then((serverData) => {
        if (serverData) setPlants(serverData);
      });
    }
    setView('tasks');
    setModal('none');
  }

  function handleAddMember(name: string) {
    const updated = [...members, name];
    setMembers(updated);
    saveMemberList(updated);
  }

  function handleEditName() {
    setEditNameValue(currentUser ?? '');
    setEditingName(true);
  }

  function handleSaveName() {
    const trimmed = editNameValue.trim();
    if (!trimmed || !currentUser) return;
    // Update member list
    const updated = members.map((m) => (m === currentUser ? trimmed : m));
    if (!updated.includes(trimmed)) {
      const idx = members.indexOf(currentUser);
      if (idx >= 0) updated[idx] = trimmed;
    }
    setMembers(updated);
    saveMemberList(updated);
    // Migrate localStorage data to new name
    const oldKey = `garden-housekeeper-plants-${currentUser}`;
    const newKey = `garden-housekeeper-plants-${trimmed}`;
    const data = localStorage.getItem(oldKey);
    if (data) {
      localStorage.setItem(newKey, data);
      if (trimmed !== currentUser) localStorage.removeItem(oldKey);
    }
    setCurrentUser(trimmed);
    setCurrentUserState(trimmed);
    setEditingName(false);
  }

  function handleCancelEditName() {
    setEditingName(false);
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
    const updated = [...plants, createPlant(values, today)];
    setPlants(updated);
    persist(updated);
    setModal('none');
    setView('archive');
  }

  function handleUpdatePlant(values: PlantFormValues) {
    if (!selectedPlant) return;
    const updated = plants.map((plant) =>
      plant.id === selectedPlant.id ? updatePlant(plant, values, today) : plant,
    );
    setPlants(updated);
    persist(updated);
    setModal('none');
  }

  function handleDeletePlant(plantId: string) {
    if (!window.confirm('确定要删除这盆植物吗？相关的养护记录也会被删除。')) return;
    const updated = deletePlant(plants, plantId);
    setPlants(updated);
    persist(updated);
    setView('archive');
  }

  function handleDeleteCareLog(plantId: string, logId: string) {
    const updated = plants.map((plant) =>
      plant.id === plantId ? deleteCareLog(plant, logId) : plant,
    );
    setPlants(updated);
    persist(updated);
  }

  function handleRecordCare(plantId: string, type: CareType) {
    const updated = plants.map((currentPlant) =>
      currentPlant.id === plantId ? recordCare(currentPlant, type, today) : currentPlant,
    );
    setPlants(updated);
    persist(updated);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8, flexWrap: 'wrap' }}>
        {editingName ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
            <input
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              style={{ flex: 1, minHeight: 32, borderRadius: 8, border: '1px solid #d8cfae', padding: '4px 10px', background: '#fffdf7', color: '#314137' }}
              autoFocus
            />
            <button className="ghost-button" type="button" onClick={handleSaveName} style={{ minHeight: 32, padding: '4px 10px', fontSize: 13 }}>保存</button>
            <button className="ghost-button" type="button" onClick={handleCancelEditName} style={{ minHeight: 32, padding: '4px 10px', fontSize: 13 }}>取消</button>
          </div>
        ) : (
          <>
            <button type="button" onClick={handleEditName} style={{ border: 0, padding: 0, background: 'none', cursor: 'pointer', fontSize: 14, color: '#72806a' }}>
              🌱 {currentUser} 的小花园 ✏️
            </button>
            <button className="ghost-button" type="button" onClick={handleSwitchUser} style={{ minHeight: 32, padding: '4px 12px', fontSize: 13 }}>
              切换成员
            </button>
          </>
        )}
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