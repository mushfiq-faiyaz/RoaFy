export const getActiveRoadmapId = () => {
  return localStorage.getItem('roafy-active-id');
};

export const setActiveRoadmapId = (id) => {
  if (id) localStorage.setItem('roafy-active-id', id);
  else localStorage.removeItem('roafy-active-id');
};

export const getAllRoadmaps = () => {
  const data = localStorage.getItem('roafy-roadmaps');
  return data ? JSON.parse(data) : {}; 
};

export const saveRoadmapData = (id, roadmap, progress) => {
  const all = getAllRoadmaps();
  all[id] = { roadmap, progress };
  localStorage.setItem('roafy-roadmaps', JSON.stringify(all));
};

export const migrateOldData = () => {
  const oldR = localStorage.getItem('roafy-roadmap');
  const oldP = localStorage.getItem('roafy-progress');
  if (oldR) {
    const id = Date.now().toString();
    setActiveRoadmapId(id);
    saveRoadmapData(id, JSON.parse(oldR), oldP ? JSON.parse(oldP) : {});
    localStorage.removeItem('roafy-roadmap');
    localStorage.removeItem('roafy-progress');
  }
};

export const getRoadmap = () => {
  migrateOldData();
  const activeId = getActiveRoadmapId();
  if (!activeId) return null;
  const all = getAllRoadmaps();
  return all[activeId]?.roadmap || null;
};

export const getProgress = () => {
  const activeId = getActiveRoadmapId();
  if (!activeId) return {};
  const all = getAllRoadmaps();
  return all[activeId]?.progress || {};
};

export const saveRoadmap = (roadmap) => {
  let activeId = getActiveRoadmapId();
  if (!activeId) {
    activeId = Date.now().toString();
    setActiveRoadmapId(activeId);
  }
  const all = getAllRoadmaps();
  const currentProgress = all[activeId]?.progress || {};
  saveRoadmapData(activeId, roadmap, currentProgress);
};

export const saveProgress = (progress) => {
  const activeId = getActiveRoadmapId();
  if (!activeId) return;
  const all = getAllRoadmaps();
  const currentRoadmap = all[activeId]?.roadmap || null;
  saveRoadmapData(activeId, currentRoadmap, progress);
};

export const clearAll = () => {
  localStorage.removeItem('roafy-active-id');
  localStorage.removeItem('roafy-roadmaps');
  localStorage.removeItem('roafy-roadmap');
  localStorage.removeItem('roafy-progress');
};

export const clearProgress = () => {
  saveProgress({});
};
