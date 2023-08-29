<template>
  <div id="app">
    <div id="mySheet">
      <CustomExcel :config="config" ref="luckySheet" @sheetScroll="handleScroll"
         @workbookCreateAfter="workbookCreateAfter" @sheetUpdata="sheetUpdata"/>
    </div>

    <div class="wrapper">
      <div>
        <label for="">
          每页数量:
          <input type="number" min="1" max="1000" v-model.number="pageSize" />
        </label>
        <label for="">
          当前页:
          <input type="number" min="1" max="1000" v-model.number="pageNum" />
        </label>
        <label for="">
          X-Access-Token::
          <input type="text" min="1" max="1000" v-model="token" />
        </label>
        <label for="">
          params:
          <input type="textarea" min="1" max="1000" v-model="params" />
        </label>
      </div>
      <div class="option">
        <button @click="renderSheet">全量数据渲染</button>
        <button @click="batchesRender">分页插入</button>
        <button @click="setRangeVal">分页范围插入</button>
        <button @click="getGediData">大数据中心数据</button>
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
import { lazyData, initData, allData, getMockData, getPageData, getRowsData } from './mock';


  export default {
    name: 'app',
    components: {
      CustomExcel,
    },
    data() {
      return {
        row: 250,
        col: 10,
        pageSize: 2,
        pageNum: 1,
        config: null,
        sheetData: {
          header: [],
          records:[]
        },
        excelData: null,
        isCellUpdateDone: false,
        range: [5, 10],
        data: null,
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb21wYW55Q29kZSI6ImE2MDEiLCJleHAiOjE2OTM1Nzc1MzMsInVzZXJuYW1lIjoiZXgwMjcwMSJ9.OlBeo03cNsTsPqMSqb-U00wohOSULRSq1YoFGSinMJ0',
        params: '{"entityId":7539432,"query":"","queryType":"sql","needHeader":true,"pageNo":1,"pageSize":2}',
        total: 0,
        sheetData: [],
      }
    },
  methods: {

    renderSheet() {
      this.$refs.luckySheet.renderExcel(allData)
    },

    exportExcel() {
      this.$refs.luckySheet.exportExcel()
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
      }

    },
    setRangeVal() {
      let data = JSON.parse(JSON.stringify(lazyData))
      data = getRowsData(data, this.range);
      const [start, end] = this.range;
      this.range = [end, end + 15];
      console.log('data.celldata', data.celldata);
      if (data.celldata.length > 0) {
        this.pageNum++;
        this.$refs.luckySheet.setRangeVal(data, () => {
          console.log('setRangeVal success');
          // 数据量少可以一次性加载
          // setTimeout(() => {
          //   this.setRangeVal();
          // }, 10); // 延迟10毫秒
        });
      }

    },

    // 滚动调用分页数据
    handleScroll(event) {
      console.log('handleScroll','pageNum',this.pageNum, 'totalSize', this.total)
      if ((this.pageNum * this.pageSize) < this.total) {
          this.pageNum++;
          this.getGediData()
      }
    },

    workbookCreateAfter() {
      console.log('workbookCreateAfter: ');
    },
    handleFetch() {
      this.pageNum = 1;
      this.getGediData();

    },
    // 渲染
    getGediData() {
      if (!this.token && !this.params) {
        alert('缺少token& 参数 ');
        return
      }
      console.log('参数', JSON.stringify(this.params))

      const params = {
        ...JSON.parse(this.params),
        pageNo: this.pageNum,
        pageSize: this.pageSize
      }
        fetch('http://10.150.110.89:6100/admin/global/cdEntity/tlistNew', {
          method: "POST",
             headers: {
              'Content-Type': 'application/json',
              'X-Access-Token': this.token
              },
              body: JSON.stringify(params),
            }).then(res => res.json()).then(data => {
              console.log('getGediData',data)
              if (data.code === 200) {
                const { result } = data;
                const { header, records, total } = result;
                let convertData =this.$refs.luckySheet.convertToSheetData(result);
                console.log('converData', convertData);
                // 第一页 渲染表头与第一页表体数据
                if (result.current === 1) {
                  this.$refs.luckySheet.renderExcel(convertData);
                  this.total = result.total;
                  this.sheetData = {
                    header,
                    records
                  }
                } else {
                  // 注意格式 渲染范围需要的是sheetdata
                  let sheetData = convertData.sheets[0];
                  console.log('setRangeVal', sheetData);
                    this.$refs.luckySheet.setRangeVal(sheetData, () => {
                    console.log('setRangeVal success')

                    });
                }
                this.sheetData.records = [...this.sheetData.records, ...records]


              }
            }).catch(e => console.log(e))
    },
    // 编辑
    editGediData(data) {
      let entityId = JSON.parse(this.params).entityId;
      const params = {
        entityId,
        data
      }

      console.log('editGediData', params)

      fetch('http://10.150.110.89:6100/admin/global/cdEntity/teditNew', {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': this.token
        },
        body: JSON.stringify(params),
      }).then(res => res.json()).then(data => {
        console.log('editGediData', data)
      })



    },
    // 单元格变更
    sheetUpdata(args) {
      // const { r}
      const [r, c, oldVal, newVal] = args;
      // console.log('sheetData',this.sheetData, this.isLoad)
        let changeRowData = this.getChangeRow(r, c, newVal.v);
        this.editGediData(changeRowData)
    },
    getChangeRow(r, c, newVal) {
      let currentColumFile = this.sheetData.header[c].code;
      this.sheetData.records[r][currentColumFile] = newVal;
      console.log('change Row', this.sheetData.records[r])
      return  this.sheetData.records[r]

    }

  },
    created() {
    console.log('initData', initData);
    console.log('lazyData', lazyData);

  },

  mounted () {
     this.$refs.luckySheet.renderExcel(initData)
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
  height: 600px;

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

