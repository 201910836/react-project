export const runBFS = async (
  map, 
  mapSize, 
  start, 
  goal, 
  speed, 
  setBfsCurrentCell,
  setBfsVisited,
  setBfsFinalPath,
  setBfsFinished
) => {
  const queue = [[start[0], start[1], []]];
  const visitedSet = new Set();
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (queue.length > 0) {
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
  setDfsFinished
) => {
  const stack = [[start[0], start[1], []]];
  const visitedSet = new Set();
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (stack.length > 0) {
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