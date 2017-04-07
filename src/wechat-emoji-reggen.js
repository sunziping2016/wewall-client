const {Trie} = require('regexgen');
const emojis = require('./components/wechat-emoji.json');
let trie = new Trie;
Object.keys(emojis).forEach(s=>trie.add(s));
console.log(trie.toRegExp('g'));