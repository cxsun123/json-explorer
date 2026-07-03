import type { Locale } from "./en";

const zh: Locale = {
  app: {
    title: "JSON 浏览器",
  },
  tabs: {
    text: "文本",
    tree: "树形",
    table: "表格",
  },
  tree: {
    expandAll: "全部展开",
    collapseAll: "全部折叠",
    expandLevel: "展开层级",
  },
  text: {
    parseAndView: "解析并查看",
    format: "格式化",
    openFile: "打开文件",
    copy: "复制",
    copied: "已复制!",
    emptyError: "请输入 JSON 文本",
    placeholder: "在此粘贴 JSON...",
  },
  confirm: {
    openFile: "打开文件",
    openFileMessage: "是否打开文件 {name}？",
    yes: "是",
    no: "否",
  },
  table: {
    key: "键",
    value: "值",
    type: "类型",
    index: "#",
    empty: "空",
    keys: "个键",
    items: "个项目",
  },
  drop: {
    title: "将 JSON 文件拖放到此处",
    hint: "将 JSON 文件拖放到面板上进行查看",
  },
};

export default zh;
