<template>
  <div id="luckysheet" class="luckysheet-content" ref="luckysheetContainer">
  </div>
</template>
<script>
  import {
    initSheet,
    tableToExcel,
    transformFileToLucky,
    getFormatterExcelData,
    renderExcel,
    updataSheet,
    toJson,
    batchesRender,
    refresh,
    lazyLoadAndRefresh,
    clearAllCell,
    setConfig,
    setRangeVal
  } from './action';
  import { exportExcel, throttle } from './utils';
  export default {
    name: "CustomExcel",
    props: {
      sheetData: {
        type: Object,
        default: () => ({
          info: {
            name: "",
            creator: "",
            lastmodifiedby: "",
            createdTime: "",
            modifiedTime: "",
            company: "",
            appversion: ""
          },
          sheets: []
        })
      },
      config: {
        type: Object
      },

    },

    data() {
      return {
        option: {
          container: "luckysheet",
          name: '自定义excel',
          lang: 'zh',
          showinfobar: false
        },
        curScrollTop: 0

      };
    },
    computed: {
      registeredEvents() {
        return this._events;
      },

      computedHook() {
        let registered = {};
        for (const key in this.hook) {
          if (key in this.$listeners) {
            registered[key] = this.hook[key];
          }
        }
        console.log('registered', registered);
        return registered;
      },
    },
    created() {
      this.mergeOption();
    },
    mounted() {
      initSheet(this.option)

    },
    methods: {
      mergeOption() {
        const { info, sheets } = this.config;
        this.option = {
          ...this.option,
          ...info,
          row: info.row + 10, //根据总行数多增加10行
          data: sheets
        }

        this.option.sheets = [];
        this.option.hook = {
          workbookCreateBefore: this.workbookCreateBefore,
          workbookCreateAfter: this.workbookCreateAfter,
          workbookDestroyBefore: this.workbookDestroyBefore,
          workbookDestroyAfter: this.workbookDestroyAfter,
          scroll: throttle(this.sheetScroll, 300),
          sheetActivate: this.sheetActivate,
          cellUpdated: this.cellUpdated
        }
      },
      getInstance() {
        return luckysheet
      },

      exportExcel() {
        exportExcel(luckysheet, this.option.name)
      },
      tableToExcel() {
        tableToExcel(this.sheetData.excelHeader, this.sheetData.excelData);
      },
      renderExcel(data) {
        window.luckysheet.destroy()
        const { info, sheets } = data;
        const option = {
          ...this.option,
          ...info,
          row: info.row + 10, //根据总行数多增加10行
          data: sheets
        }

        option.sheets = [];
        console.log('option', option);
        renderExcel(option)

      },
      updataSheet(data) {
        window.luckysheet.destroy()
        const { info, sheets } = data;
        const option = {
          ...this.option,
          ...info,
          // row: info.count + 10, //根据总行数多增加10行
          data: sheets
        }
        updataSheet(option)
      },
      clearAllCell() {
        let option = {
          container: "luckysheet",
          title: '',
          lang: 'zh',
          row: this.option.row,
          data: [
            {
              name: 'sheet',
              celldata: []
            }
          ]
        }

        initSheet(option)

        // clearAllCell()
      },
      toJson() {
        return toJson()
      },

      transToData() {
        let transToCellData = luckysheet.transToCellData([this.sheetData])
        console.log('transToCellData: ', transToCellData);
        let transToData = luckysheet.transToData([...this.sheetData])
        console.log('transToData: ', transToData);
      },
      batchesRender(data) {
        batchesRender(data)
      },
      lazyLoadAndRefresh(data, batchNum, cb) {
        lazyLoadAndRefresh(data, batchNum, cb)
      },


      // 事件
      workbookCreateBefore(book) {
        console.log('workbookCreateBefore: ');
        this.$emit("workbookCreateBefore", book);
      },

      workbookCreateAfter(book) {
        // console.log('workbookCreateAfter');
        this.$emit("workbookCreateAfter", book);

      },

      workbookDestroyBefore(book) {
        this.$emit("workbookDestroyBefore", book);
      },

      workbookDestroyAfter(book) {
        this.$emit("workbookDestroyAfter", book);
      },
      sheetScroll(event) {
        const { canvasHeight, scrollLeft, scrollTop } = event;
        console.log('object :>> ', canvasHeight, scrollTop);
        if (scrollTop > this.curScrollTop) {
          this.curScrollTop = scrollTop
          this.$emit('sheetScroll', event)
        }

      },
      sheetActivate(index, isPivotInitial, isNewSheet) {
        console.info(index, isPivotInitial, isNewSheet)
        this.$emit('sheetActivate', event)
      },
      cellUpdated() {
        // console.log('cellUpdated: ');

      },
      setRangeVal(data, cb) {
        setRangeVal(data, cb)
      }

    },


  };
</script>
<style lang="css" scoped>
  .luckysheet-content {
    width: 100%;
    height: 100%;
  }
</style>
