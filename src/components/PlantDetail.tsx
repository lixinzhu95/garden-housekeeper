import type { CareType, Plant } from '../domain/types';
import { getCareTips } from '../domain/careTips';

interface PlantDetailProps {
  plant: Plant;
  onBack: () => void;
  onEdit: () => void;
  onRecordCare: (plantId: string, type: CareType) => void;
  onDeleteCareLog: (plantId: string, logId: string) => void;
}

const careLabels: Record<CareType, string> = {
  watering: '浇水',
  fertilizing: '施肥',
};

export default function PlantDetail({ plant, onBack, onEdit, onRecordCare, onDeleteCareLog }: PlantDetailProps) {
  const tips = getCareTips(plant.name);
  return (
    <section className="page-stack">
      <button className="ghost-button back-button" type="button" onClick={onBack}>返回</button>

      <article className="detail-card">
        {plant.image ? <img src={plant.image} alt={plant.name} /> : <div className="detail-placeholder" aria-hidden="true">🌿</div>}
        <div>
          <p className="eyebrow">花草详情</p>
          <h1>{plant.name}</h1>
          <p>浇水周期：每 {plant.wateringIntervalDays} 天</p>
          <p>{plant.fertilizingIntervalDays === null ? '施肥提醒：已关闭' : `施肥周期：每 ${plant.fertilizingIntervalDays} 天`}</p>
        </div>
      </article>

      <div className="button-row detail-actions">
        <button className="primary-button" type="button" onClick={() => onRecordCare(plant.id, 'watering')}>记录浇水</button>
        {plant.fertilizingIntervalDays !== null ? (
          <button className="primary-button" type="button" onClick={() => onRecordCare(plant.id, 'fertilizing')}>记录施肥</button>
        ) : null}
        <button className="secondary-button" type="button" onClick={onEdit}>编辑</button>
      </div>

      {tips ? (
        <section className="sheet-card history-card">
          <h2>🌱 养护技巧</h2>
          <p className="care-tips">{tips}</p>
        </section>
      ) : null}

      <section className="sheet-card history-card">
        <h2>养护历史</h2>
        {plant.careLogs.length === 0 ? (
          <p className="muted">📋 还没有记录</p>
        ) : (
          <ol className="timeline">
            {plant.careLogs.map((log) => (
              <li key={log.id}>
                <span aria-hidden="true">{log.type === 'watering' ? '💧' : '🌿'}</span>
                <strong>{log.date}</strong>
                <small>{careLabels[log.type]}</small>
                <button
                  className="ghost-button delete-log"
                  type="button"
                  onClick={() => onDeleteCareLog(plant.id, log.id)}
                  aria-label={`删除${log.date}的${careLabels[log.type]}记录`}
                >
                  删除
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
