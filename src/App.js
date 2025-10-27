import { useState, useEffect } from 'react';
import { runBFS, runDFS, runDijkstra } from './pathfindingAlgorithms';
import { getMapDataFromResponse } from './mapDataConverter';

function App() {
  const [map, setMap] = useState([]);
  const [mapSize, setMapSize] = useState(0);
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState(null);
  
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

  // Dijkstra 상태
  const [dijkstraVisited, setDijkstraVisited] = useState(new Set());
  const [dijkstraCurrentCell, setDijkstraCurrentCell] = useState(null);
  const [dijkstraFinalPath, setDijkstraFinalPath] = useState([]);
  const [dijkstraFinished, setDijkstraFinished] = useState(false);

  // DQN 상태
  const [dqnPath, setDqnPath] = useState([]);
  const [dqnVisited, setDqnVisited] = useState(new Set());
  const [dqnCurrentCell, setDqnCurrentCell] = useState(null);
  const [dqnCurrentIndex, setDqnCurrentIndex] = useState(0);
  const [dqnFinished, setDqnFinished] = useState(false);

  // 공통 상태
  const [isSearching, setIsSearching] = useState(false);
  const [speed, setSpeed] = useState(100);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        console.log('맵 데이터 요청 시작...');
        const response = await fetch('https://9c41e93b-be0c-4a6f-b48c-e3e8b4ceab28.mock.pstmn.io/maps');
        console.log('응답 상태:', response.status, response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('백엔드에서 받은 데이터:', data);

          const mapData = getMapDataFromResponse(data);
          console.log('파싱된 맵 데이터:', mapData);

          setMap(mapData.grid);
          setStart(mapData.start);
          setGoal(mapData.goal);
          setMapSize(mapData.mapSize);

          console.log('맵 데이터 설정 완료:', {
            gridSize: mapData.grid.length,
            start: mapData.start,
            goal: mapData.goal,
            mapSize: mapData.mapSize
          });
        } else {
          console.warn('백엔드에서 맵을 받아올 수 없습니다. 상태:', response.status);
        }
      } catch (error) {
        console.error('서버에서 맵을 가져오는데 실패했습니다:', error);
      }
    };

    fetchMapData();
  }, []);


  // 3개 알고리즘 동시 탐색 시작
  const startTripleSearch = async () => {
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

    setDijkstraVisited(new Set());
    setDijkstraCurrentCell(null);
    setDijkstraFinalPath([]);
    setDijkstraFinished(false);

    setDqnPath([]);
    setDqnVisited(new Set());
    setDqnCurrentCell(null);
    setDqnCurrentIndex(0);
    setDqnFinished(false);

    // 백엔드에서 DQN 경로 데이터 받아오기
    let dqnPathData = [];
    try {
      const response = await fetch('https://9c41e93b-be0c-4a6f-b48c-e3e8b4ceab28.mock.pstmn.io/path');
      if (response.ok) {
        const data = await response.json();
        // path, Path, Path (index) 형식으로 받아온 경로를 [row, col] 형식으로 변환
        const pathArray = data.path || data.Path || data["Path (index)"];
        console.log('받아온 경로 데이터:', pathArray);
        if (pathArray && Array.isArray(pathArray)) {
          dqnPathData = pathArray.map(pos => {
            if (Array.isArray(pos) && pos.length === 2) {
              return pos;
            } else if (typeof pos === "string") {
              // "(15, 1)" 형식을 [15, 1]로 변환
              const cleaned = pos.replace(/[()]/g, "");
              const [row, col] = cleaned.split(",").map(s => parseInt(s.trim(), 10));
              return [row, col];
            }
            return null;
          }).filter(item => item !== null);
        }
      }
    } catch (error) {
      console.error('DQN 경로를 받아오는데 실패했습니다:', error);
    }

    setDqnPath(dqnPathData);

    // BFS, DFS, Dijkstra, DQN을 동시에 실행
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
        ),
        runDijkstra(
          map,
          mapSize,
          start,
          goal,
          speed,
          setDijkstraCurrentCell,
          setDijkstraVisited,
          setDijkstraFinalPath,
          setDijkstraFinished
        ),
        runDQNPath(
          dqnPathData,
          speed,
          setDqnCurrentCell,
          setDqnCurrentIndex,
          setDqnVisited,
          setDqnFinished
        )
      ]);
    } catch (error) {
      console.log('Search stopped');
    } finally {
      setIsSearching(false);
    }
  };

  // DQN 경로 실행
  const runDQNPath = async (path, speed, setCurrentCell, setCurrentIndex, setVisited, setFinished) => {
    if (!path || path.length === 0) {
      setFinished(true);
      return;
    }

    const visitedSet = new Set();
    for (let i = 0; i < path.length; i++) {
      const [row, col] = path[i];
      const cellKey = `${row}-${col}`;

      setCurrentCell([row, col]);
      setCurrentIndex(i);

      // 현재까지의 방문 칸들 추가
      visitedSet.add(cellKey);
      setVisited(new Set(visitedSet));

      await new Promise(resolve => setTimeout(resolve, speed));
    }

    setCurrentCell(null);
    setFinished(true);
  };

  // 맵 생성
  const handleNewMap = async () => {
    if (isSearching) return;

    try {
      const response = await fetch('https://9c41e93b-be0c-4a6f-b48c-e3e8b4ceab28.mock.pstmn.io/maps');
      if (response.ok) {
        const data = await response.json();
        const mapData = getMapDataFromResponse(data);
        setMap(mapData.grid);
        setStart(mapData.start);
        setGoal(mapData.goal);
        setMapSize(mapData.mapSize);
      } else {
        console.warn('백엔드에서 맵을 받아올 수 없습니다.');
      }
    } catch (error) {
      console.error('서버에서 맵을 가져오는데 실패했습니다:', error);
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
    setDijkstraVisited(new Set());
    setDijkstraCurrentCell(null);
    setDijkstraFinalPath([]);
    setDijkstraFinished(false);
    setDqnPath([]);
    setDqnVisited(new Set());
    setDqnCurrentCell(null);
    setDqnCurrentIndex(0);
    setDqnFinished(false);
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
    else if (start && row === start[0] && col === start[1]) {
      return 'bg-green-400';
    }
    else if (goal && row === goal[0] && col === goal[1]) {
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
    else if (start && row === start[0] && col === start[1]) {
      return 'bg-green-400';
    }
    else if (goal && row === goal[0] && col === goal[1]) {
      return 'bg-red-500';
    }
    else if (map[row] && map[row][col] === 1) {
      return 'bg-gray-800';
    }
    else {
      return 'bg-gray-100';
    }
  };

  // 셀 색상 결정 (Dijkstra용)
  const getDijkstraCellColor = (row, col) => {
    const cellKey = `${row}-${col}`;

    if (dijkstraFinalPath.some(([r, c]) => r === row && c === col)) {
      return 'bg-emerald-400';
    }
    else if (dijkstraCurrentCell && dijkstraCurrentCell[0] === row && dijkstraCurrentCell[1] === col) {
      return 'bg-teal-400 animate-pulse';
    }
    else if (dijkstraVisited.has(cellKey)) {
      return 'bg-teal-200';
    }
    else if (start && row === start[0] && col === start[1]) {
      return 'bg-green-400';
    }
    else if (goal && row === goal[0] && col === goal[1]) {
      return 'bg-red-500';
    }
    else if (map[row] && map[row][col] === 1) {
      return 'bg-gray-800';
    }
    else {
      return 'bg-gray-100';
    }
  };

  // 셀 색상 결정 (DQN용)
  const getDQNCellColor = (row, col) => {
    const cellKey = `${row}-${col}`;

    // 방문한 칸 표시
    if (dqnVisited.has(cellKey)) {
      return 'bg-indigo-400';
    }

    // 현재 칸 표시
    if (dqnCurrentCell && dqnCurrentCell[0] === row && dqnCurrentCell[1] === col) {
      return 'bg-violet-400 animate-pulse';
    }
    else if (start && row === start[0] && col === start[1]) {
      return 'bg-green-400';
    }
    else if (goal && row === goal[0] && col === goal[1]) {
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
          onClick={startTripleSearch}
          disabled={isSearching}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
        >
          {isSearching ? '3자 대결 중...' : '🚀 3자 대결 시작!'}
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


      {/* 4분할 맵 그리드 */}
      <div className="grid grid-cols-2 gap-6">
        {/* BFS 맵 */}
        <div className="flex flex-col items-center">
          <div className="mb-3 text-center">
            <h3 className="text-lg font-bold text-blue-600 mb-2">BFS (너비 우선 탐색)</h3>
            <div className="flex justify-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded"></div>
                <span>현재</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-200 rounded"></div>
                <span>방문</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded"></div>
                <span>경로</span>
              </div>
            </div>
          </div>
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
          <div className="mb-3 text-center">
            <h3 className="text-lg font-bold text-purple-600 mb-2">DFS (깊이 우선 탐색)</h3>
            <div className="flex justify-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded"></div>
                <span>현재</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-pink-200 rounded"></div>
                <span>방문</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded"></div>
                <span>경로</span>
              </div>
            </div>
          </div>
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

        {/* Dijkstra 맵 */}
        <div className="flex flex-col items-center">
          <div className="mb-3 text-center">
            <h3 className="text-lg font-bold text-emerald-600 mb-2">Dijkstra (다익스트라)</h3>
            <div className="flex justify-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-teal-400 rounded"></div>
                <span>현재</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-teal-200 rounded"></div>
                <span>방문</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded"></div>
                <span>경로</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center overflow-auto">
            <div
              className="grid gap-0 p-2 bg-gray-300 rounded-lg border-2 border-emerald-400"
              style={{
                gridTemplateColumns: `repeat(${mapSize}, 1fr)`,
                width: 'fit-content'
              }}
            >
              {map.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`dijkstra-${rowIndex}-${colIndex}`}
                    className={`w-2 h-2 ${getDijkstraCellColor(rowIndex, colIndex)} border-gray-400`}
                    style={{ borderWidth: '0.25px' }}
                  />
                ))
              )}
            </div>
          </div>
          <div className="mt-2 text-center text-sm">
            <p className="font-bold text-emerald-600">
              방문: {dijkstraVisited.size}개 | 경로: {dijkstraFinalPath.length}스텝
            </p>
            {dijkstraFinished && <p className="text-green-600">✅ 완료!</p>}
          </div>
        </div>

        {/* DQN 맵 */}
        <div className="flex flex-col items-center">
          <div className="mb-3 text-center">
            <h3 className="text-lg font-bold text-indigo-600 mb-2">DQN (딥큐네트워크)</h3>
            <div className="flex justify-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-violet-400 rounded"></div>
                <span>현재</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded"></div>
                <span>경로</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center overflow-auto">
            <div
              className="grid gap-0 p-2 bg-gray-300 rounded-lg border-2 border-indigo-400"
              style={{
                gridTemplateColumns: `repeat(${mapSize}, 1fr)`,
                width: 'fit-content'
              }}
            >
              {map.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`dqn-${rowIndex}-${colIndex}`}
                    className={`w-2 h-2 ${getDQNCellColor(rowIndex, colIndex)} border-gray-400`}
                    style={{ borderWidth: '0.25px' }}
                  />
                ))
              )}
            </div>
          </div>
          <div className="mt-2 text-center text-sm">
            <p className="font-bold text-indigo-600">
              경로: {dqnPath.length}스텝 | 진행: {dqnCurrentIndex + 1}/{dqnPath.length}
            </p>
            {dqnFinished && <p className="text-green-600">✅ 완료!</p>}
          </div>
        </div>
      </div>

      {/* 4자 대결 결과 */}
      {bfsFinished && dfsFinished && dijkstraFinished && dqnFinished && (
        <div className="mt-6 text-center p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🏆 4자 대결 결과</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-blue-600">
              <p><strong>BFS</strong></p>
              <p>방문한 셀: {bfsVisited.size}개</p>
              <p>최종 경로: {bfsFinalPath.length}스텝</p>
            </div>
            <div className="text-purple-600">
              <p><strong>DFS</strong></p>
              <p>방문한 셀: {dfsVisited.size}개</p>
              <p>최종 경로: {dfsFinalPath.length}스텝</p>
            </div>
            <div className="text-emerald-600">
              <p><strong>Dijkstra</strong></p>
              <p>방문한 셀: {dijkstraVisited.size}개</p>
              <p>최종 경로: {dijkstraFinalPath.length}스텝</p>
            </div>
            <div className="text-indigo-600">
              <p><strong>DQN</strong></p>
              <p>방문한 셀: {dqnVisited.size}개</p>
              <p>최종 경로: {dqnPath.length}스텝</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            {(() => {
              const results = [
                { name: 'BFS', steps: bfsFinalPath.length, visited: bfsVisited.size, color: 'text-blue-600' },
                { name: 'DFS', steps: dfsFinalPath.length, visited: dfsVisited.size, color: 'text-purple-600' },
                { name: 'Dijkstra', steps: dijkstraFinalPath.length, visited: dijkstraVisited.size, color: 'text-emerald-600' },
                { name: 'DQN', steps: dqnPath.length, visited: dqnVisited.size, color: 'text-indigo-600' }
              ].filter(p => p.steps > 0)
               // 1차: 스텝으로 정렬, 2차: 방문으로 정렬
               .sort((a, b) => {
                 if (a.steps !== b.steps) return a.steps - b.steps;
                 return a.visited - b.visited;
               });

              if (results.length > 0) {
                const winner = results[0];
                return <p className={`font-bold ${winner.color}`}>🏆 {winner.name} 우승! ({winner.steps}스텝, 방문 {winner.visited}개)</p>;
              }
              return null;
            })()}
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