import U from "../AX6Util";

let sum = function () {
  let value = 0,
    i = this.list.length;
  while (i--) {
    if (!("__groupingList" in this.list[i])) {
      value += U.number(this.list[i][this.key]);
    }
  }
  return value;
};

let avg = function () {
  let value = 0,
    i = this.list.length, listLength = 0;
  while (i--) {
    if (!("__groupingList" in this.list[i])) {
      value += U.number(this.list[i][this.key]);
      listLength++;
    }
  }
  return U.number(value / (listLength || 1), {"round": 2});
};

/**
 * @module AX6UIGrid_collector
 */
export default {
  /**
   *
   */
  sum: sum,
  /**
   *
   */
  avg: avg
};