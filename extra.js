extraElem.appendChild(
    checkbox({
        txt: "Uncap hitting power",
        onchange: (v) => {
            inputGlobal.uncapPower = v;
            generateCode();
        },
    }).element
);

extraElem.appendChild(descriptor("Hitting power is normally capped at 150 by the code"));

extraElem.appendChild(
    checkbox({
        txt: "Uncap contact zone size",
        onchange: (v) => {
            inputGlobal.uncapContact = v;
            generateCode();
        },
    }).element
);

extraElem.appendChild(
    checkbox({
        txt: "Dev mode",
        onchange: (v) => {
            inputGlobal.devMode = v;
            generateCode();
        },
    }).element
);

extraElem.appendChild(descriptor("The only limit on what you can set a stat to will be the byte size of the field. This will have unintended results for many stats.", 2));