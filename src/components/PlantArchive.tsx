import type { Plant } from '../domain/types';

interface PlantArchiveProps {
  plants: Plant[];
  onAddPlant: () => void;
  onOpenPlant: (plantId: string) => void;
}

export default function PlantArchive({ plants, onAddPlant, onOpenPlant }: PlantArchiveProps) {
  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">花草档案</p>
          <h1>我的小花园</h1>
        </div>
        <button className="primary-button" type="button" onClick={onAddPlant}>新增</button>
      </div>

      {plants.length === 0 ? (
        <div className="empty-card">🌱 先添加第一盆花吧</div>
      ) : (
        <div className="plant-grid">
          {plants.map((plant) => (
            <button key={plant.id} className="plant-card" type="button" onClick={() => onOpenPlant(plant.id)}>
              {plant.image ? <img src={plant.image} alt="" /> : <div className="plant-placeholder" aria-hidden="true">🌱</div>}
              <strong>{plant.name}</strong>
              <small>下次浇水：{plant.nextWateringDate}</small>
              {plant.nextFertilizingDate ? <small>下次施肥：{plant.nextFertilizingDate}</small> : null}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
