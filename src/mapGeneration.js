export const generateRoadMap = (mapSize, start, goal) => {
  const newMap = [];
  for (let i = 0; i < mapSize; i++) {
    newMap[i] = [];
    for (let j = 0; j < mapSize; j++) {
      newMap[i][j] = 1;
    }
  }

  const createRoad = (startX, startY, direction, length, width = 2) => {
    let x = startX;
    let y = startY;
    
    for (let i = 0; i < length; i++) {
      for (let w = 0; w < width; w++) {
        let roadX = x;
        let roadY = y;
        
        if (direction === 'horizontal') {
          roadY = y + w;
        } else {
          roadX = x + w;
        }
        
        if (roadX >= 0 && roadX < mapSize && roadY >= 0 && roadY < mapSize) {
          newMap[roadY][roadX] = 0;
        }
      }
      
      switch (direction) {
        case 'horizontal': x++; break;
        case 'vertical': y++; break;
      }
      
      if (x >= mapSize || y >= mapSize) break;
    }
  };

  // 메인 도로들
  const horizontalRoads = Math.floor(Math.random() * 4) + 3;
  for (let i = 0; i < horizontalRoads; i++) {
    const y = Math.floor(Math.random() * (mapSize - 8)) + 4;
    createRoad(0, y, 'horizontal', mapSize, 3);
  }

  const verticalRoads = Math.floor(Math.random() * 4) + 3;
  for (let i = 0; i < verticalRoads; i++) {
    const x = Math.floor(Math.random() * (mapSize - 8)) + 4;
    createRoad(x, 0, 'vertical', mapSize, 3);
  }

  // 연결 도로들
  const connectionRoads = Math.floor(Math.random() * 8) + 5;
  for (let i = 0; i < connectionRoads; i++) {
    const startX = Math.floor(Math.random() * mapSize);
    const startY = Math.floor(Math.random() * mapSize);
    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const length = Math.floor(Math.random() * 10) + 5;
    createRoad(startX, startY, direction, length, 2);
  }

  // 작은 길들
  const smallRoads = Math.floor(Math.random() * 15) + 10;
  for (let i = 0; i < smallRoads; i++) {
    const startX = Math.floor(Math.random() * mapSize);
    const startY = Math.floor(Math.random() * mapSize);
    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const length = Math.floor(Math.random() * 6) + 3;
    createRoad(startX, startY, direction, length, 1);
  }

  // 건물 블록들
  const blockCount = Math.floor(Math.random() * 8) + 6;
  for (let i = 0; i < blockCount; i++) {
    const blockX = Math.floor(Math.random() * (mapSize - 6)) + 2;
    const blockY = Math.floor(Math.random() * (mapSize - 6)) + 2;
    const blockWidth = Math.floor(Math.random() * 3) + 2;
    const blockHeight = Math.floor(Math.random() * 3) + 2;
    
    for (let y = blockY; y < Math.min(blockY + blockHeight, mapSize); y++) {
      for (let x = blockX; x < Math.min(blockX + blockWidth, mapSize); x++) {
        newMap[y][x] = 1;
      }
    }
  }

  // 시작점과 목표점 주변 도로 확보
  const ensureRoadAround = (row, col) => {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < mapSize && newCol >= 0 && newCol < mapSize) {
          newMap[newRow][newCol] = 0;
        }
      }
    }
  };

  ensureRoadAround(start[0], start[1]);
  ensureRoadAround(goal[0], goal[1]);

  return newMap;
};