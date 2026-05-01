export const getRoadmap = () => {
  const data = localStorage.getItem('roafy-roadmap');
  return data ? JSON.parse(data) : null;
};

export const saveRoadmap = (roadmap) => {
  localStorage.setItem('roafy-roadmap', JSON.stringify(roadmap));
};

export const getProgress = () => {
  const data = localStorage.getItem('roafy-progress');
  return data ? JSON.parse(data) : {};
};

export const saveProgress = (progress) => {
  localStorage.setItem('roafy-progress', JSON.stringify(progress));
};

export const clearAll = () => {
  localStorage.removeItem('roafy-roadmap');
  localStorage.removeItem('roafy-progress');
};

export const clearProgress = () => {
  localStorage.removeItem('roafy-progress');
};
