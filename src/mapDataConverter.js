/**
 * 백엔드에서 받은 맵 데이터를 파싱하는 유틸리티
 *
 * 기대하는 백엔드 응답 형식:
 * {
 *   "Map size": "24 x 24",
 *   "Start position": "(15, 1)",
 *   "Destination position": "(7, 22)",
 *   "Manhattan distance": 29,
 *   "grid": [[1, 0, ...], ...]
 * }
 *
 * 또는 간단한 형식:
 * {
 *   "grid": [[1, 0, ...], ...],
 *   "start": [15, 1],
 *   "goal": [7, 22]
 * }
 */

export const parseMapData = (data) => {
  try {
    // "grid" 또는 "map" 필드 지원
    const grid = data.grid || data.map;

    // 입력값이 없거나 grid가 없으면 null 반환
    if (!grid || !Array.isArray(grid)) {
      return null;
    }
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;

    // start 위치 파싱
    let start = null;
    if (data.start && Array.isArray(data.start) && data.start.length === 2) {
      // 형식: [row, col]
      start = data.start;
    } else if (data["Start position"] && typeof data["Start position"] === "string") {
      // 형식: "(15, 1)"
      start = parsePositionString(data["Start position"]);
    }

    // goal 위치 파싱
    let goal = null;
    if (data.goal && Array.isArray(data.goal) && data.goal.length === 2) {
      // 형식: [row, col]
      goal = data.goal;
    } else if (data["Destination position"] && typeof data["Destination position"] === "string") {
      // 형식: "(7, 22)"
      goal = parsePositionString(data["Destination position"]);
    }

    // mapSize 파싱
    let mapSize = null;
    if (data.mapSize && typeof data.mapSize === "number") {
      mapSize = data.mapSize;
    } else if (data.size && typeof data.size === "number") {
      // Mock Server 응답 형식: "size" 필드 사용
      mapSize = data.size;
    } else if (data["Map size"]) {
      if (typeof data["Map size"] === "number") {
        // 형식: 24
        mapSize = data["Map size"];
      } else if (typeof data["Map size"] === "string") {
        // 형식: "24 x 24"
        mapSize = parseMapSizeString(data["Map size"]);
      }
    } else {
      // 그리드 크기로 추정 (정사각형이라고 가정)
      mapSize = rows;
    }

    // 기본값 설정 (만약 파싱되지 않았다면)
    if (!start) {
      // 좌측 중앙에서 시작
      start = [Math.floor(rows / 2), 1];
    }
    if (!goal) {
      // 우측 중앙을 목표로 설정
      goal = [Math.floor(rows / 2), cols - 2];
    }

    return {
      grid,
      start,
      goal,
      mapSize,
      rows,
      cols,
      // 선택적: 메타데이터
      manhattanDistance: data["Manhattan distance"] || null,
    };
  } catch (error) {
    console.error("맵 데이터 파싱 중 오류 발생:", error);
    return null;
  }
};

/**
 * "(15, 1)" 형식의 문자열을 [row, col]로 변환
 */
const parsePositionString = (positionString) => {
  try {
    // "(15, 1)" -> "15, 1" -> [15, 1]
    const cleaned = positionString.replace(/[()]/g, "");
    const parts = cleaned.split(",").map((s) => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    console.error("위치 문자열 파싱 실패:", positionString);
    return null;
  } catch (error) {
    console.error("위치 문자열 파싱 중 오류:", positionString, error);
    return null;
  }
};

/**
 * "24 x 24" 형식의 문자열을 정수로 변환
 */
const parseMapSizeString = (mapSizeString) => {
  try {
    // "24 x 24" -> "24"
    const match = mapSizeString.match(/(\d+)\s*x\s*(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  } catch (error) {
    console.error("맵 크기 문자열 파싱 실패:", mapSizeString);
    return null;
  }
};

/**
 * 여러 형식의 백엔드 응답을 처리하는 메인 함수
 */
export const getMapDataFromResponse = (response) => {
  const parsed = parseMapData(response);

  if (!parsed) {
    throw new Error("유효하지 않은 맵 데이터 형식");
  }

  return {
    grid: parsed.grid,
    start: parsed.start,
    goal: parsed.goal,
    mapSize: parsed.mapSize,
  };
};
