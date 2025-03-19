function boundStat (stat, v) {
    let min = (inputGlobal.devMode ? undefined : stat.min) ?? 0;
    let max = (inputGlobal.devMode ? undefined : stat.max) ?? (1 << (stat.size * 8)) - 1;
    v = v < min ? min : v;
    v = v > max ? max : v;
    return v;
}

function setStat(stat, v) {
    v = boundStat(stat, v);
    inputGlobal.player.new[stat.offset] = v;
    return v;
}

function trueValue(player, stat) {
    return player['new'][stat.offset] ?? all['new'][stat.offset] ?? player['old'][stat.offset] ?? '';
}

let chosePlayer = function (v) {
    if (!isNaN(v)) {
        var player = v == -1 ? all : players[v];
        inputGlobal.player = player;
    }
    // console.log(v);
    for (let stat of nonStaticStats) {
        statInputs[stat.offset].default = inputGlobal.player.old[stat.offset];
        statInputs[stat.offset].setValue(trueValue(inputGlobal.player, stat));
    }
}

let playerInds = [];
for(var n in players){playerInds.push(n);}
let playerInput = selectInput({
    txt: 'player',
    options: ['All', ...players.map(x => x['name'])],
    values: [-1, ...playerInds],
    default: -1,
    noHighlight: 1,
    onchange: chosePlayer,
});
fields.appendChild(playerInput.element);

for(let stat of nonStaticStats){
    let name = stat.name;
    let input;
    if (stat.name.match(/trajectory/i)) {
        input = selectInput({
            txt: name,
            options: ['', 'low', 'medium', 'high'],
            values: [255, 2, 0, 1],
            default: 255,
            // This has made me realize I'm accidentally relying on NaN abuse, ugh
            // Well it ain't broke
            onchange: (v) => {
                setStat(stat, v == 255 ? NaN : v);
                generateCode();
            }
        });
    } else {
        input = numInput({
            txt: name,
            onchange: (v) => {
                var out = setStat(stat, v);
                generateCode();
                return out;
            }
        });
    }
    fields.appendChild(input.element);
    statInputs[stat.offset] = input;
    if (name.match(/ability/i)) {
        fields.appendChild(descriptor("Changing this can cause crashes, be careful!", 1));
    }
}