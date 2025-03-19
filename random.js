let randomFields = {
    miis: 0,
    hide: 0,
    stats: {},
};

// 0x24 => pitching
// 0x25 => batting
// 0x26 => fielding
// 0x27 => speed
var display_related = {
    // curveball speed and curve
    0x28: {d: 0x24, w: 1},
    0x2c: {d: 0x24, w: 1},
    // hit power and contact size
    0x18: {d: 0x25, w: 1},
    0x14: {d: 0x25, w: 1/3},
    '-1': {d: 0x25, w: 1},
    // fielding and throwing speed
    0x22: {d: 0x26, w: 1/2},
    0x20: {d: 0x26, w: 1},
    // speed
    0x1e: {d:0x27, w: 1},
}

var extra_fields = {
    0x18: {s: 0x1a, m: 1.25},
    0x14: {s: 0x16, m: 0.75},
    0x28: {s: 0x2a, m: 1.15},
}

function setRandVal(stat, v, which) {
    v = boundStat(stat, v);
    (randomFields.stats[stat.offset] ??= {})[which ? "high" : "low"] = v;
    return v;
}

function setRandStatEnabled (stat, v) {
    (randomFields.stats[stat.offset] ??= {})['enabled'] = !!v;
}

for (let stat of nonStaticStats) {
    if (isNaN(stat['random'])) {
        continue;
    }
    let name = stat['name'];
    randomElem.appendChild(checkRangeInput({
        txt: name,
        defaultmin: stat['low'],
        defaultmax: stat['high'],
        onchangemin: (v) => {
            return setRandVal(stat, v, 0);
        },
        onchangemax: (v) => {
            return setRandVal(stat, v, 1);
        },
        ontoggle: (v) => {
            setRandStatEnabled(stat, v);
        }
    }));
    if (name.match(/hit power/i)) {
        randomElem.appendChild(descriptor("Charge hit power will be 25% higher"));
    } else if (name.match(/contact size/i)) {
        randomElem.appendChild(descriptor("Charge contact size will be set 33% lower"));
    } else if (name.match(/curveball/i)) {
        randomElem.appendChild(descriptor("Charge pitch speed will be set 15% higher"));
    }
}

randomElem.appendChild(
    checkbox({
        txt: 'randomize hit trajectories',
        onchange: (v) => {
            setRandStatEnabled(statsByOffset[-0x1], v);
        } 
    }).element
);

let useMiis = checkbox({
    txt: "use miis?",
    onchange: (v) => {
        randomFields['miis'] = v;
    }
});

randomElem.appendChild(useMiis.element);

let hideStats = checkbox({
    txt: "hide stats in-game?",
    onchange: (v) => {
        randomFields['hide'] = v;
    }
});

randomElem.appendChild(hideStats.element);
randomElem.append(descriptor("Don't update the in-game stat bars to reflect the generated stats.", 0));

let randomizeOutput = document.createElement('p');
randomizeOutput.id = "randomizeOutput";
randomElem.appendChild(randomizeOutput);

let btn = document.createElement('button');
btn.innerText = "Randomize!";
btn.id = "randomize_btn";
btn.onclick = function(){
    let validPlayers = players.filter((x) => {
        if (x['name'].match(/unused/i)){
            return 0;
        }
        if(!randomFields.miis && x['name'].match(/mii/i)){
            return 0;   
        }
        return 1;
    });
    let chosenPlayers = [];
    while(chosenPlayers.length < 27){
        let ind = Math.floor(Math.random() * validPlayers.length);
        chosenPlayers.push(validPlayers[ind]);
        validPlayers.splice(ind, 1);
    }
    chosenPlayers.forEach(player => {
        var displays = {
            0x24: {v: 0, w: 0},
            0x25: {v: 0, w: 0},
            0x26: {v: 0, w: 0},
            0x27: {v: 0, w: 0},
        };
        for (let offset in randomFields.stats) {
            let stat = randomFields.stats[offset];
            if (!stat['enabled']) {
                continue;
            }
            if (offset == -0x1) {
                let val = Math.floor(Math.random() * 3);
                player['new'][offset] = val;
                let related = display_related[offset];
                displays[related.d].v += [0.65, 1, 0][val];
                displays[related.d].w += related.w;
                continue;
            }
            var low = stat['low'];
            var high = stat['high'];
            var val = low + Math.floor(Math.random() * (high - low + 1));
            player['new'][offset] = val;
            if(extra_fields[offset]) {
                let field = extra_fields[offset];
                player['new'][field.s] = Math.floor(boundStat(statsByOffset[field.s], val * field.m));
            }
            if (display_related[offset]) {
                let related = display_related[offset];
                displays[related.d].v +=
                    (high == low ? 0.5 : (val - low) / (high - low))
                    * related.w;
                displays[related.d].w += related.w;
            }
        }
        if(randomFields.hide){
            player['new'][0x24] = 0;
            player['new'][0x25] = 0;
            player['new'][0x26] = 0;
            player['new'][0x27] = 0;
        } else {
            for (var offset in displays) {
                if (displays[offset].w == 0) {
                    continue;
                } else {
                    player['new'][offset] = Math.round(displays[offset].v / displays[offset].w * 10);
                }
            }
        }
    });
    
    let out = "The stats for 27 characters have been randomized!\n";
    out += "(Randomizing all players would make a Gecko code too long to work)\n";
    out += "Team 1: ";
    for(var i = 0; i < 9; i ++){
        out += chosenPlayers[i]['name'] + (i < 8 ? ', ' : '');
    }
    out += "\nTeam 2: ";
    for(var i = 9; i < 18; i ++){
        out += chosenPlayers[i]['name'] + (i < 17 ? ', ' : '');
    }
    out += "\nBench (an extra 9 thrown in because there's room): ";
    for(var i = 18; i < 27; i ++){
        out += chosenPlayers[i]['name'] + (i < 26 ? ', ' : '');
    }
    out += "\n\nYou can see and continue to edit the stats in the players tab.";
    randomizeOutput.innerText = out;
    chosePlayer();
    generateCode();
    btn.style.display = "none";
};
randomElem.appendChild(btn);