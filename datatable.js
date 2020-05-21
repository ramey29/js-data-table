"use strict";
class RDatatable {
  constructor(options) {
    try {
      this.setConfig(options.config || {});
      if (options.el) {
        let eL = options.el.charAt(0);
        if (eL === "#") {
          this.element = document.getElementById(options.el.substr(1));
        } else if (eL === ".") {
          this.element = document.getElementsByClassName(
            options.el.substr(1)
          )[0];
        } else {
          this.element = document.getElementsByTagName(options.el)[0];
        }
      } else {
        return this.errorHandler("data element missing or invalid");
      }
      if (options.data) {
        this.data = options.data;
        this.init();
      } else if (options.url) {
        this.url = options.url;
        this.fetchData(this.url);
      } else {
        return this.errorHandler("url and data missing or invalid");
      }
    } catch (e) {
      return this.errorHandler(e || "whats happening!!");
    }
  }
  setConfig(config) {
    this.default = {
      isSearchBar: false,
      isSortable: false,
      isStickyHeader: false,
      isResponsive: false,
      ispaginated: true,
      pageSize: 10,
      pageNumber: 0,
      dataMap: {},
      sortData: {},
      filterData: [],
    };
    this.config = { ...this.default, ...config };
  }
  errorHandler(error) {
    throw new Error(error);
  }
  fetchData(url) {
    fetch(url)
      .then((response) => {
        response
          .json()
          .then((resp) => {
            this.data = resp;
            this.init();
          })
          .catch((er) => this.errorHandler(er));
      })
      .catch((e) => this.errorHandler(e));
  }
  init() {
    this.header = this.getHeaderItems();
    this.body = this.getBodyItems();
    this.refID = this.createRandomID();
    let thead = `<thead><tr>${this.header}</tr></thead>`;
    let tbody = `<tbody>${this.body}</tbody>`;
    let table = `<table class="dataRTable" id="${this.refID}">${thead} ${tbody}</table>`;
    console.log(this.config.ispaginated);
    this.element.innerHTML = `${table}`;
  }
  getHeaderItems() {
    let header = "";
    for (let column in this.config.dataMap) {
      header += `<th>${column}</th>`;
    }
    return header;
  }
  getBodyItems() {
    let body = "";
    let rowData = this.getData();
    let startIndex = (this.config.pageNumber - 1) * this.config.pageSize;
    let endIndex = startIndex + this.config.pageSize;
    let data = rowData.slice(startIndex, endIndex);
    data.forEach((row) => {
      let tdContent = "";
      for (let column in this.config.dataMap) {
        let dataMapping = this.config.dataMap[column];
        let columContent = this.renderRowData(dataMapping, row);
        tdContent += `<td>${columContent}</td>`;
      }
      body += `<tr>${tdContent}</tr>`;
    });
    return body;
  }
  renderRowData(dataMapping, row) {
    let finalMapping = dataMapping;
    let map = "";
    let regex = /\<!.*?\!>/g;
    while ((map = regex.exec(dataMapping)) !== null) {
      let x = map[0];
      let y = x.replace("<!", "").replace("!>", "");
      y = y.replace(".", "[0].");
      finalMapping = finalMapping.replace(x, row[y]);
    }
    return finalMapping;
  }
  getData() {
    return this.data;
  }
  createRandomID() {
    return `rtable-${new Date().getTime()}`;
  }
}
