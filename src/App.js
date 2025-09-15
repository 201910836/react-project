import { useState, useEffect } from 'react';
import { generateRoadMap } from './mapGeneration';
import { runBFS, runDFS } from './pathfindingAlgorithms';

function App() {
  const [map, setMap] = useState([]);
  const [mapSize] = useState(32);
  const [start] = useState([15, 1]);
  const [goal] = useState([15, 30]);
  
  // BFS 상태
  const [bfsVisited, setBfsVisited] = useState(new Set());
  const [bfsCurrentCell, setBfsCurrentCell] = useState(null);
  const [bfsFinalPath, setBfsFinalPath] = useState([]);
  const [bfsFinished, setBfsFinished] = useState(false);
  
  // DFS 상태
  const [dfsVisited, setDfsVisited] = useState(new Set());
  const [dfsCurrentCell, setDfsCurrentCell] = useState(null);
  const [dfsFinalPath, setDfsFinalPath] = useState([]);
  const [dfsFinished, setDfsFinished] = useState(false);
  
  // 공통 상태
  const [isSearching, setIsSearching] = useState(false);
  const [speed, setSpeed] = useState(100);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch('https://558151d9-7672-4129-88c2-c035248ce8c1.mock.pstmn.io/maps');
        if (response.ok) {
          const data = await response.json();
          setMap(data.grid || data);
        } else {
          setMap(generateRoadMap(mapSize, start, goal));
        }
      } catch (error) {
        console.error('서버에서 맵을 가져오는데 실패했습니다:', error);
        setMap(generateRoadMap(mapSize, start, goal));
      }
    };
    
    fetchMapData();
  }, [mapSize, start, goal]);


  // 동시 탐색 시작
  const startDualSearch = async () => {
    setIsSearching(true);
    
    // 모든 상태 초기화
    setBfsVisited(new Set());
    setBfsCurrentCell(null);
    setBfsFinalPath([]);
    setBfsFinished(false);
    
    setDfsVisited(new Set());
    setDfsCurrentCell(null);
    setDfsFinalPath([]);
    setDfsFinished(false);

    // BFS와 DFS를 동시에 실행
    try {
      await Promise.all([
        runBFS(
          map, 
          mapSize, 
          start, 
          goal, 
          speed, 
          setBfsCurrentCell,
          setBfsVisited,
          setBfsFinalPath,
          setBfsFinished
        ),
        runDFS(
          map,
          mapSize,
          start,
          goal,
          speed,
          setDfsCurrentCell,
          setDfsVisited,
          setDfsFinalPath,
          setDfsFinished
        )
      ]);
    } catch (error) {
      console.log('Search stopped');
    } finally {
      setIsSearching(false);
    }
  };

  // 맵 생성
  const handleNewMap = async () => {
    if (isSearching) return;
    
    try {
      const response = await fetch('https://558151d9-7672-4129-88c2-c035248ce8c1.mock.pstmn.io/maps');
      if (response.ok) {
        const data = await response.json();
        setMap(data.grid || data);
      } else {
        setMap(generateRoadMap(mapSize, start, goal));
      }
    } catch (error) {
      console.error('서버에서 맵을 가져오는데 실패했습니다:', error);
      setMap(generateRoadMap(mapSize, start, goal));
    }
    
    resetAll();
  };

  // 전체 리셋
  const resetAll = () => {
    setIsSearching(false);
    setBfsVisited(new Set());
    setBfsCurrentCell(null);
    setBfsFinalPath([]);
    setBfsFinished(false);
    setDfsVisited(new Set());
    setDfsCurrentCell(null);
    setDfsFinalPath([]);
    setDfsFinished(false);
  };

  // 셀 색상 결정 (BFS용)
  const getBfsCellColor = (row, col) => {
    const cellKey = `${row}-${col}`;
    
    if (bfsFinalPath.some(([r, c]) => r === row && c === col)) {
      return 'bg-blue-400';
    }
    else if (bfsCurrentCell && bfsCurrentCell[0] === row && bfsCurrentCell[1] === col) {
      return 'bg-yellow-400 animate-pulse';
    }
    else if (bfsVisited.has(cellKey)) {
      return 'bg-orange-200';
    }
    else if (row === start[0] && col === start[1]) {
      return 'bg-green-400';
    }
    else if (row === goal[0] && col === goal[1]) {
      return 'bg-red-500';
    }
    else if (map[row] && map[row][col] === 1) {
      return 'bg-gray-800';
    }
    else {
      return 'bg-gray-100';
    }
  };

  // 셀 색상 결정 (DFS용)
  const getDfsCellColor = (row, col) => {
    const cellKey = `${row}-${col}`;
    
    if (dfsFinalPath.some(([r, c]) => r === row && c === col)) {
      return 'bg-purple-400';
    }
    else if (dfsCurrentCell && dfsCurrentCell[0] === row && dfsCurrentCell[1] === col) {
      return 'bg-pink-400 animate-pulse';
    }
    else if (dfsVisited.has(cellKey)) {
      return 'bg-pink-200';
    }
    else if (row === start[0] && col === start[1]) {
      return 'bg-green-400';
    }
    else if (row === goal[0] && col === goal[1]) {
      return 'bg-red-500';
    }
    else if (map[row] && map[row][col] === 1) {
      return 'bg-gray-800';
    }
    else {
      return 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
         dqn vs 전통적 알고리즘 대결! 🥊
      </h1>
      
      {/* 컨트롤 패널 */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button 
          onClick={handleNewMap}
          disabled={isSearching}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400"
        >
          새 도로맵 생성
        </button>
        
        <button 
          onClick={startDualSearch}
          disabled={isSearching}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
        >
          {isSearching ? '대결 중...' : '🚀 대결 시작!'}
        </button>
        
        <button 
          onClick={resetAll}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          리셋
        </button>
      </div>

      {/* 속도 조절 */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <label className="text-sm font-medium">탐색 속도:</label>
        <input
          type="range"
          min="10"
          max="500"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          disabled={isSearching}
          className="w-32"
        />
        <span className="text-sm text-gray-600">{speed}ms</span>
      </div>

      {/* 범례 */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-blue-600 mb-2">BFS (너비 우선 탐색)</h3>
          <div className="flex justify-center gap-3 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>현재</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-200 rounded"></div>
              <span>방문</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>경로</span>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-purple-600 mb-2">DFS (깊이 우선 탐색)</h3>
          <div className="flex justify-center gap-3 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-400 rounded"></div>
              <span>현재</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-200 rounded"></div>
              <span>방문</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-400 rounded"></div>
              <span>경로</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2분할 맵 그리드 */}
      <div className="grid grid-cols-2 gap-6">
        {/* BFS 맵 */}
        <div className="flex flex-col items-center">
          <div className="flex justify-center overflow-auto">
            <div 
              className="grid gap-0 p-2 bg-gray-300 rounded-lg border-2 border-blue-400"
              style={{ 
                gridTemplateColumns: `repeat(${mapSize}, 1fr)`,
                width: 'fit-content'
              }}
            >
              {map.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`bfs-${rowIndex}-${colIndex}`}
                    className={`w-2 h-2 ${getBfsCellColor(rowIndex, colIndex)} border-gray-400`}
                    style={{ borderWidth: '0.25px' }}
                  />
                ))
              )}
            </div>
          </div>
          <div className="mt-2 text-center text-sm">
            <p className="font-bold text-blue-600">
              방문: {bfsVisited.size}개 | 경로: {bfsFinalPath.length}스텝
            </p>
            {bfsFinished && <p className="text-green-600">✅ 완료!</p>}
          </div>
        </div>

        {/* DFS 맵 */}
        <div className="flex flex-col items-center">
          <div className="flex justify-center overflow-auto">
            <div 
              className="grid gap-0 p-2 bg-gray-300 rounded-lg border-2 border-purple-400"
              style={{ 
                gridTemplateColumns: `repeat(${mapSize}, 1fr)`,
                width: 'fit-content'
              }}
            >
              {map.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`dfs-${rowIndex}-${colIndex}`}
                    className={`w-2 h-2 ${getDfsCellColor(rowIndex, colIndex)} border-gray-400`}
                    style={{ borderWidth: '0.25px' }}
                  />
                ))
              )}
            </div>
          </div>
          <div className="mt-2 text-center text-sm">
            <p className="font-bold text-purple-600">
              방문: {dfsVisited.size}개 | 경로: {dfsFinalPath.length}스텝
            </p>
            {dfsFinished && <p className="text-green-600">✅ 완료!</p>}
          </div>
        </div>
      </div>

      {/* 대결 결과 */}
      {bfsFinished && dfsFinished && (
        <div className="mt-6 text-center p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🏆 대결 결과</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-blue-600">
              <p><strong>BFS</strong></p>
              <p>방문한 셀: {bfsVisited.size}개</p>
              <p>최종 경로: {bfsFinalPath.length}스텝</p>
              <p>{bfsFinalPath.length > 0 && dfsFinalPath.length > 0 && bfsFinalPath.length <= dfsFinalPath.length ? '🏆 최단경로 우승!' : ''}</p>
            </div>
            <div className="text-purple-600">
              <p><strong>DFS</strong></p>
              <p>방문한 셀: {dfsVisited.size}개</p>
              <p>최종 경로: {dfsFinalPath.length}스텝</p>
              <p>{dfsFinalPath.length > 0 && bfsFinalPath.length > 0 && dfsFinalPath.length < bfsFinalPath.length ? '🏆 더 짧은 경로!' : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* 공통 범례 */}
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>시작점</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>목표점</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 rounded"></div>
          <span>장애물</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>도로</span>
        </div>
      </div>
    </div>
  );
}

export default App;