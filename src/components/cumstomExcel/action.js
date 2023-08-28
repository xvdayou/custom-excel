import * as le from "luckyexcel";
import Excel from "exceljs";

/**
 * 将excel文件导入excel组件
 * @param {*} file 导入的excel文件
 */
export const transformFileToLucky = (file, option) => {
  le.transformExcelToLucky(
    file,
    function(exportJson, luckysheetfile) {
      // 获得转化后的表格数据后，使用luckysheet初始化，或者更新已有的luckysheet工作簿
      // 注：luckysheet需要引入依赖包和初始化表格容器才可以使用
      console.log("transformFileToLucky  exportJson: ", exportJson.sheets);
      console.log("transformFileToLucky  luckysheetfile: ", luckysheetfile);

      window.luckysheet.create({
        ...option,
        container: "luckysheet", // luckysheet is the container id
        showinfobar: false,
        data: exportJson.sheets
      });
    },
    function(err) {
      console.log("Import failed. Is your fail a valid xlsx?");
    }
  );
};
/**
 * 将表格数据回显到excel中
 * @param {*} header 表格头部数组
 * @param {*} tableData 表格数据
 * @param {*} total 表体总长度
 */
export const tableToExcel = async (header, tableData, option) => {
  // 创建工作簿
  const workbook = new Excel.Workbook();
  // 添加工作表
  const worksheet = workbook.addWorksheet("Sheet1");
  // 添加列标题并定义列键

  console.log("head", [...header]);
  console.log("tableData", [...tableData]);

  worksheet.columns = [...header];
  // 添加多行数据
  worksheet.addRows([...tableData]);
  // 写入 buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const file = new File([buffer], "xxx.xlsx");

  transformFileToLucky(file, option);
};

export const getFormatterExcelData = file => {
  // 先确保获取到了xlsx文件file，再使用全局方法window.LuckyExcel转化

  return new Promise((resolve, reject) => {
    le.transformExcelToLucky(
      file,
      function(exportJson, luckysheetfile) {
        // 获得转化后的表格数据后，使用luckysheet初始化，或者更新已有的luckysheet工作簿
        // 注：luckysheet需要引入依赖包和初始化表格容器才可以使

        if (exportJson && luckysheetfile) {
          // return { exportJson, luckysheetfile };
          // console.log(object);

          resolve({ exportJson, luckysheetfile });
        }
      },
      function(err) {
        // logger.error("Import failed. Is your fail a valid xlsx?");
        reject(err);
      }
    );
  });
};

export function initSheet(option) {
  console.log("initSheet", option);
  window.luckysheet.create({ ...option });
}

export function renderExcel(option = {}) {
  console.log("renderExcel: ", option);

  window.luckysheet.create(option);
}

export function updataSheet(options) {
  console.log("updataSheet", options);
  window.luckysheet.updataSheet(options);
  // window.luckysheet.refresh(options);
}
export function toJson() {
  return window.luckysheet.toJson();
}

/**
 * 分批渲染
 * @param {*} data
 * @param {*} rowNum 一次渲染多少行
 */
export function batchesRender(data, rowNum = 1) {
  data.forEach((item, index) => {
    console.log("item", data[index]);
    // window.luckysheet.setCellValue()
    const { excelHeader, excelData } = item;
    dataRendSheet(excelHeader, excelData);
  });
}

function dataRendSheet(excelHeader, excelData) {
  console.log("dataRendSheet", excelHeader, excelData);
  //回显表格表头，第一行
  if (excelHeader.length > 0) {
    excelHeader.forEach((item1, index1) => {
      luckysheet.setCellValue(0, index1, item1.header);
      //普通回显数据
      excelData.forEach((item2, index2) => {
        var row = index2 + 1;
        luckysheet.setCellValue(row, index1, item2.name);
      });
    });
  }
}

export function refresh(sheetData) {
  // 渲染工作表的单元格数据
  const celldata = sheetData.sheets[0].celldata;
  console.log("cellData", celldata);
  celldata.forEach(cell => {
    const { r, c, v } = cell;
    if (v.hasOwnProperty("v")) {
      // 如果单元格数据包含 "v" 属性，则使用 setCellValue 设置单元格内容;
      window.luckysheet.setCellValue(r, c, v.v);
    }
    // 如果您还有其他样式信息，可以在此处使用 Luckysheet 提供的 API 方法设置
  });
}

/**
 *
 * @param {*} sheetData
 * @param {*} batchSize 批量渲染的数量
 */
export function lazyLoadAndRefresh(sheetData, batchSize = 20, cb) {
  const { celldata, config } = sheetData;
  let rowIndex = 0; // 当前加载的行索引
  function loadBatch() {
    if (!celldata) {
      console.log("loadBatch no celldata");
      return;
    }
    // 存在配置 且还没有设置过的
    // if (
    //   !isEmptyObject(config) &&
    //   isEmptyObject(window.luckysheet.getConfig())
    // ) {
    //   console.log("set config");
    //   setConfig(config);
    // }

    for (let i = 0; i < batchSize && rowIndex < celldata.length; i++) {
      const cell = celldata[rowIndex];
      const { r, c, v } = cell;
      // const value = getValueFromCell(v);
      // console.log("setCellValue", r, c, value);
      window.luckysheet.setCellValue(r, c, v);
      // console.log("object :>> setCellValue");
      rowIndex++;
      if (rowIndex === celldata.length - 1) {
        console.log("last");
        cb && cb();
      }
    }

    if (rowIndex < celldata.length) {
      // requestAnimationFrame(loadBatch);
      loadBatch();
    } else {
      rowIndex = 0;
    }
  }

  loadBatch();
}

function getValueFromCell(cellValue) {
  if (cellValue.hasOwnProperty("v")) {
    return cellValue.v;
  } else if (cellValue.hasOwnProperty("ct")) {
    const inlineStr = cellValue.ct.t === "inlineStr";
    if (inlineStr) {
      return cellValue.ct.s.map(style => style.v).join("");
    }
  }
  return "";
}

export function clearAllCell() {
  const luckysheet = window.luckysheet;
  // 获取当前工作表对象
  const activeSheet = luckysheet.getActiveSheet();
  // 清空整个工作表的内容
  activeSheet.data = [];
  // 刷新工作表
  luckysheet.refresh();
}

export function setConfig(config) {
  window.luckysheet.setConfig(config);
}

function isEmptyObject(obj) {
  return JSON.stringify(obj) === "{}";
}
/**
 *
 * @param {*} celldata
 * @returns  {row:[0,1],column:[0,1]}
 */
function getRange(celldata) {
  if (!Array.isArray(celldata)) {
    console.log("getRange celldata not array");
    return;
  }

  if (celldata.length === 0) {
    console.log("celldata.length===0");
    return;
  }

  let range = {};
  if (celldata.length === 1) {
    const { r, c } = celldata[0];
    range = {
      row: [r, r],
      column: [c, c]
    };
  } else {
    const { r: startRow, c: startColum } = celldata[0];
    const { r: endRow, c: endColum } = celldata[celldata.length - 1];
    range = {
      row: [startRow, endRow],
      column: [startColum, endColum]
    };
  }

  return range;
}

function getTransData(celldata) {
  let data = luckysheet.transToData(celldata);
  // 过滤掉所有null的数据
  data = data.filter(arr => !arr.every(v => v === null));
  data = data.map(subArray => subArray.filter(item => item !== null));
  return data;
}

export function setRangeVal(sheetdata, cb) {
  let range = getRange(sheetdata.celldata);
  // console.log("celldata", sheetdata.celldata);
  if (range) {
    // let data = getTransData(sheetdata.celldata);
    let data = celldataToTrans(sheetdata.celldata);
    console.log(" getTransData", data);
    //getRange 中最末尾一行数据最大列可能会小于其他列
    let maxColum = data[0].length;
    range.column = [range.column[0], maxColum - 1];
    luckysheet.setRangeValue(data, { range, success: cb });
  }
}

export function celldataToTrans(celldata) {
  // 计算总行数和总列数
  let maxRow = 0;
  let maxColumn = 0;
  celldata.forEach(item => {
    maxRow = Math.max(maxRow, item.r);
    maxColumn = Math.max(maxColumn, item.c);
  });

  // 创建二维数组并填充默认值为null
  let twoDimensionalData = [];
  for (let i = 0; i <= maxRow; i++) {
    const row = new Array(maxColumn + 1).fill(null);
    twoDimensionalData.push(row);
  }

  console.log(twoDimensionalData);

  // 填充二维数组
  celldata.forEach(item => {
    twoDimensionalData[item.r][item.c] = item.v || 1;
  });

  // 过滤掉
  twoDimensionalData = twoDimensionalData.filter(
    arr => !arr.every(v => v === null)
  );
  console.log("twoDimensionalData final", twoDimensionalData);
  return twoDimensionalData;
}
