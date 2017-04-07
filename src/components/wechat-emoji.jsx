import wechat_emoji_mapping from './wechat-emoji.json';
import findAndReplaceDOMText from 'findandreplacedomtext';

const wechat_emoji_search = /\[\u56E7\]|\/:(?:weak|:(?:,@|\-[OS\|]|\'[\(\|]|[!\$\(-\+8<>@BDLO-QTXZdg\|~])|dig|sun|>\-\||<(?:[LOW]>|@)|(?:jum|ski)p|(?:gif|shi|ea)t|h(?:andclap|eart)|(?:tur|moo)n|(?:lov|sh(?:owlov|a[kr])|fad|ros|c(?:ircl|offe|ak)|wip)e|[&P]\-\(|,@(?:\-D|[!@Pfox])|\-\-b|8(?:\-\)|\*)|!!!|k(?:otow|n)|b(?:reak|eer|ad|(?:om|y)e)|(?:ladybu|stron|pi|hu)g|jj|xx|@[\)>@x]|no|pd|o[Yko]|[\?v]|(?:baske|foo)tb|l(?:vu|i)|[BX\|]\-\))/g;

function wechat_emoji(dom) {
    findAndReplaceDOMText(dom, {
        find: wechat_emoji_search,
        replace: (portion, match) => {
            if (portion.index) return '';
            let name = wechat_emoji_mapping[match.input.slice(match.startIndex, match.endIndex)];
            if (!name) return portion.text;
            let img = document.createElement('img');
            img.className = 'wechat-emoji';
            img.src = `../assets/wechat-emoji/${name}.png`;
            return img
        }
    });
    return dom;
}

export { wechat_emoji };
