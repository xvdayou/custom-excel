export const getMockData = (row, col) => {
  const result = [];

  for (let j = 0; j < +row + 1; j++) {
    for (let i = 0; i < +col; i++) {
      if (j === 0) {
        result.push({
          r: j,
          c: i,
          v: {
            ct: {
              fa: "General",
              t: "inlineStr",
              s: [
                {
                  bg: "#000000",
                  bl: 0,
                  cl: 0,
                  fc: "blue",
                  v: "header"
                }
              ]
            },
            bg: "#ff0000",
            fs: 10,
            ff: "微软雅黑",
            ht: 1,
            vt: 1,
            tb: 1
          }
        });
      } else {
        result.push({
          r: j,
          c: i,
          v: {
            v: "测试数据",
            ct: { fa: "@", t: "s" },
            m: "测试实打实打算"
          }
        });
      }
    }
  }
  console.log("result", result);
  return result;
};

export const getPageData = (data, rowsPerPage, page) => {
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.celldata.length);
  data.celldata = data.celldata.slice(startIndex, endIndex);
  return data;
};

export const getRowsData = (data, range) => {
  const [start, end] = range;
  console.log(start, end);
  console.log("init", data.celldata);
  data.celldata = data.celldata.filter(
    item => start <= item.r && item.r <= end
  );
  console.log("row data", data.celldata);
  return data;
};
