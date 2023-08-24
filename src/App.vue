<template>
  <div id="app">
    <div id="mySheet">
      <CustomExcel v-if="config" :config="config" :sheetData="sheetData" ref="luckySheet" @sheetScroll="handleScroll"
        @sheetActivate="sheetActivate" @workbookCreateAfter="workbookCreateAfter" />
    </div>

    <div class="wrapper" v-show="false">
      <div>
        <label for="">
          表数量:
          <input type="number" min="1" max="10" v-model.number="sheet" />
        </label>
        <label for="">
          行数:
          <input type="number" min="1" max="5000" v-model.number="row" />
        </label>
        <label for="">
          列数:
          <input type="number" min="1" max="1000" v-model.number="col" />
        </label>
      </div>
      <div>
        <label for="">
          每页数量:
          <input type="number" min="1" max="1000" v-model.number="pageSize" />
        </label>
        <label for="">
          当前页:
          <input type="number" min="1" max="1000" v-model.number="pageNum" />
        </label>

        <button @click="handleNextPage">下一页</button>
      </div>
      <div class="option">
        <button @click="renderSheet">全量数据渲染</button>
        <button @click="batchesRender">分页插入</button>
        <button @click="setRangeVal">分页范围插入</button>
        <button @click="toJson">转换成JSON</button>
        <button @click="exportExcel">导出excel</button>
        <button @click="clear">清空数据</button>
      </div>
    </div>
  </div>
</template>

<script>

  import CustomExcel from './components/cumstomExcel';
  import { getFormatterExcelData, celldataToTrans } from './components/cumstomExcel/action.js';
  import { lazyData, initData, allData, getMockData, getPageData, simpleData, simpleData1, getRowsData } from './mock';
  import { throttle } from './components/cumstomExcel/utils/throttle.js';



  export default {
    name: 'app',
    components: {
      CustomExcel,

    },
    data() {
      return {
        sheet: 1,
        row: 250,
        col: 10,
        pageSize: 5,
        pageNum: 1,
        config: null,
        sheetData: {},
        excelData: null,
        isCellUpdateDone: false,
        range: [5, 10]


      }
    },
    methods: {

      handleNextPage() {
        this.batchesRender();
      },

      renderSheet() {
        // this.$refs.luckySheet.renderExcel(this.getOption())
        this.$refs.luckySheet.renderExcel(allData)

      },

      exportExcel() {
        this.$refs.luckySheet.exportExcel()
      },
      tableToExcel() {
        this.$refs.luckySheet.tableToExcel()
      },


      clear() {
        this.pageNum = 1;
        this.$refs.luckySheet.clearAllCell()
      },
      toJson() {
        const jsonData = this.$refs.luckySheet.toJson();
        console.log('jsonData', jsonData);
        console.log(celldataToTrans(jsonData.data[0].celldata));
      },
      batchesRender() {
        let data = JSON.parse(JSON.stringify(lazyData))
        data = getPageData(data, this.pageSize * 52, this.pageNum);
        if (data.celldata.length > 0) {
          this.pageNum++
          console.log('batchesRender', data);
          this.$refs.luckySheet.lazyLoadAndRefresh(data, 20);
          // this.batchesRender()

          // throttle(this.batchesRender(), 300)

          // setTimeout(() => {
          //   this.batchesRender()
          // }, 300)

        }

      },

      setRangeVal() {
        let data = JSON.parse(JSON.stringify(lazyData))
        data = getRowsData(data, this.range);
        const [start, end] = this.range;
        this.range = [end, end + 15];
        console.log('data.celldata', data.celldata);
        if (data.celldata.length > 0) {
          this.pageNum++
          this.$refs.luckySheet.setRangeVal(data, () => {
            console.log('setRangeVal success');
            // setTimeout(() => {
            //   this.setRangeVal();
            // }, 10); // 延迟100毫秒

          });
        }

      },
      refresh() {
        console.log('excelJson', excelJson);
        // this.$refs.luckySheet.refresh(mockData);
        this.sheetData = getMockData(this.row, this.col);
        console.log('renderExcel', this.sheetData);
        const startTime = performance.now()
        // this.$refs.luckySheet.updataSheet(this.sheetData)
        this.$refs.luckySheet.updataSheet(simpleData1)
      },
      updata() {
        this.$refs.luckySheet.updataSheet(allData)
      },
      handleScroll(event) {
        console.log("handleScroll", event);
        this.setRangeVal()

      },
      transToData() {
        this.$refs.luckySheet.updataSheet(simpleData1)
      },
      workbookCreateAfter() {
        console.log('workbookCreateAfter: ');
        // this.$refs.luckySheet.lazyLoadAndRefresh(simpleData, 1);
        // setTimeout(() => {
        //   this.$refs.luckySheet.lazyLoadAndRefresh(simpleData1, 2);
        // }, 1000)

      },
      sheetActivate() { }
    },

    created() {
      this.config = initData;

      console.log('initData', initData);
      console.log('lazyData', lazyData);
    },


  }
</script>

<style>
  body {
    margin: 0;
    padding: 0;

  }

  #app {
    height: 100vh;
  }


  #mySheet {
    width: 100%;
    height: 100%;

  }

  .wrapper {
    margin-top: 20px;
    background-color: gainsboro;
    height: 200px;
    padding: 10px;

  }

  .wrapper div {
    margin-bottom: 10px;
  }


  button {
    margin-right: 5px;
  }
</style>
