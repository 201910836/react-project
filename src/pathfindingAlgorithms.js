export const runBFS = async (
  map,
  mapSize,
  start,
  goal,
  speed,
  setBfsCurrentCell,
  setBfsVisited,
  setBfsFinalPath,
  setBfsFinished,
  cancelledRef
) => {
  const queue = [[start[0], start[1], []]];
  const visitedSet = new Set();
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (queue.length > 0) {
    if (cancelledRef.current) return;

    const [row, col, path] = queue.shift();
    const cellKey = `${row}-${col}`;

    if (visitedSet.has(cellKey)) continue;

    setBfsCurrentCell([row, col]);
    visitedSet.add(cellKey);
    setBfsVisited(new Set(visitedSet));

    if (row === goal[0] && col === goal[1]) {
      const fullPath = [...path, [row, col]];
      setBfsFinalPath(fullPath);
      setBfsCurrentCell(null);
      setBfsFinished(true);
      return;
    }

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      const newKey = `${newRow}-${newCol}`;

      if (
        newRow >= 0 && newRow < mapSize &&
        newCol >= 0 && newCol < mapSize &&
        map[newRow] && map[newRow][newCol] === 0 &&
        !visitedSet.has(newKey)
      ) {
        queue.push([newRow, newCol, [...path, [row, col]]]);
      }
    }

    await new Promise(resolve => setTimeout(resolve, speed));
  }

  setBfsCurrentCell(null);
  setBfsFinished(true);
};

export const runDFS = async (
  map,
  mapSize,
  start,
  goal,
  speed,
  setDfsCurrentCell,
  setDfsVisited,
  setDfsFinalPath,
  setDfsFinished,
  cancelledRef
) => {
  const stack = [[start[0], start[1], []]];
  const visitedSet = new Set();
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (stack.length > 0) {
    if (cancelledRef.current) return;

    const [row, col, path] = stack.pop();
    const cellKey = `${row}-${col}`;

    if (visitedSet.has(cellKey)) continue;

    setDfsCurrentCell([row, col]);
    visitedSet.add(cellKey);
    setDfsVisited(new Set(visitedSet));

    if (row === goal[0] && col === goal[1]) {
      const fullPath = [...path, [row, col]];
      setDfsFinalPath(fullPath);
      setDfsCurrentCell(null);
      setDfsFinished(true);
      return;
    }

    for (let i = directions.length - 1; i >= 0; i--) {
      const [dx, dy] = directions[i];
      const newRow = row + dx;
      const newCol = col + dy;
      const newKey = `${newRow}-${newCol}`;

      if (
        newRow >= 0 && newRow < mapSize &&
        newCol >= 0 && newCol < mapSize &&
        map[newRow] && map[newRow][newCol] === 0 &&
        !visitedSet.has(newKey)
      ) {
        stack.push([newRow, newCol, [...path, [row, col]]]);
      }
    }

    await new Promise(resolve => setTimeout(resolve, speed));
  }

  setDfsCurrentCell(null);
  setDfsFinished(true);
};

export const runDijkstra = async (
  map,
  mapSize,
  start,
  goal,
  speed,
  setDijkstraCurrentCell,
  setDijkstraVisited,
  setDijkstraFinalPath,
  setDijkstraFinished,
  cancelledRef
) => {
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  const visitedSet = new Set();
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  for (let row = 0; row < mapSize; row++) {
    for (let col = 0; col < mapSize; col++) {
      if (map[row] && map[row][col] === 0) {
        const key = `${row}-${col}`;
        distances[key] = row === start[0] && col === start[1] ? 0 : Infinity;
        previous[key] = null;
        unvisited.add(key);
      }
    }
  }

  while (unvisited.size > 0) {
    if (cancelledRef.current) return;

    let currentKey = null;
    let minDistance = Infinity;

    for (const key of unvisited) {
      if (distances[key] < minDistance) {
        minDistance = distances[key];
        currentKey = key;
      }
    }

    if (!currentKey || distances[currentKey] === Infinity) break;

    const [currentRow, currentCol] = currentKey.split('-').map(Number);
    unvisited.delete(currentKey);
    visitedSet.add(currentKey);

    setDijkstraCurrentCell([currentRow, currentCol]);
    setDijkstraVisited(new Set(visitedSet));

    if (currentRow === goal[0] && currentCol === goal[1]) {
      const path = [];
      let pathKey = currentKey;
      while (pathKey) {
        const [row, col] = pathKey.split('-').map(Number);
        path.unshift([row, col]);
        pathKey = previous[pathKey];
      }
      setDijkstraFinalPath(path);
      setDijkstraCurrentCell(null);
      setDijkstraFinished(true);
      return;
    }

    for (const [dx, dy] of directions) {
      const newRow = currentRow + dx;
      const newCol = currentCol + dy;
      const newKey = `${newRow}-${newCol}`;

      if (
        newRow >= 0 && newRow < mapSize &&
        newCol >= 0 && newCol < mapSize &&
        map[newRow] && map[newRow][newCol] === 0 &&
        unvisited.has(newKey)
      ) {
        const alt = distances[currentKey] + 1;
        if (alt < distances[newKey]) {
          distances[newKey] = alt;
          previous[newKey] = currentKey;
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, speed));
  }

  setDijkstraCurrentCell(null);
  setDijkstraFinished(true);
};