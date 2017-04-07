let wechat_extra_emoji = {
    '\ue415': '\u{1f604}',
    '\ue40c': '\u{1f637}',
    '\ue412': '\u{1f602}',
    '\ue409': '\u{1f61d}',
    '\ue40d': '\u{1f633}',
    '\ue107': '\u{1f631}',
    '\ue403': '\u{1f614}',
    '\ue40e': '\u{1f612}',
    '\ue11b': '\u{1f47b}',
    '\ue41d': '\u{1f64f}',
    '\ue14c': '\u{1f4aa}',
    '\ue312': '\u{1f389}',
    '\ue112': '\u{1f381}',
};

function wechat_emoji_extra(text) {
    Object.keys(wechat_extra_emoji).forEach(x => text = text.replace(new RegExp(x, 'g'), wechat_extra_emoji[x]));
    return text;
}

export { wechat_emoji_extra };
