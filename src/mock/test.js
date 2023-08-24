export const getMockData = (row, col) => {
  const result = [];

  for (let j = 0; j < row; j++) {
    for (let i = 0; i < col; i++) {
      const cellData = {
        r: j,
        c: i,
        v: {}
      };

      if (j === 0) {
        cellData.v = {
          ct: {
            fa: "General",
            t: "inlineStr",
            s: [
              {
                bg: "#000000",
                bl: 0,
                cl: 0,
                fc: "blue",
                v: "header" + i
              }
            ]
          },
          bg: "#ff0000",
          fs: 10,
          ff: "微软雅黑",
          ht: 1,
          vt: 1,
          tb: 1
        };
      } else {
        cellData.v = {
          v: "测试数据",
          ct: { fa: "@", t: "s" },
          m: "测试实打实打算"
        };
      }

      result.push(cellData);
    }
  }

  return result;
};
