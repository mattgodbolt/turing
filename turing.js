window.onload = function () {
    init();
};

var tm;
var cells = [];
var current = null;
var breakpoints = {};
var stopping = false;
var breakOnNewState = false;
var stateNode;

function fillWithZeros() {
    return {
        begin: {any: "P0 R R begin"},
    };
}

function turingExample() {
    return {
        begin: {'': "Pe R Pe R P0 R R P0 L L o"},
        o: {
            '1': "R Px L L L o",
            '0': "q"
        },
        q: {
            any: "R R q",
            '': 'P1 L p'
        },
        p: {
            x: 'E R q',
            e: 'R f',
            '': 'L L p'
        },
        f: {
            any: "R R f",
            '': 'P0 L L o'
        }
    };
}

function multiply() {
    return {
        begin: {'': 'P@ R P1 new'},
        'new': {
            '@': "R markDigits",
            any: "L new"
        },
        markDigits: {
            '0': "R Px R markDigits",
            '1': 'R Px R markDigits',
            '': 'R Pz R R Pr findX'
        },
        findX: {
            x: 'E firstR',
            '@': 'findDigits',
            any: 'L L findX'
        },
        firstR: {
            r: 'R R lastR',
            'any': 'R R firstR'
        },
        lastR: {
            r: 'R R lastR',
            '': 'Pr R R Pr findX'
        },
        findDigits: {
            '@': 'R R find1stDigit',
            any: 'L L findDigits'
        },
        find1stDigit: {
            x: 'L found1stDigit',
            y: 'L found1stDigit',
            z: 'L found2ndDigit',
            '': 'R R find1stDigit'
        },
        found1stDigit: {
            '0': 'R addZero',
            '1': 'R R R find2ndDigit'
        },
        find2ndDigit: {
            x: 'L found2ndDigit',
            y: 'L found2ndDigit',
            '': 'R R find2ndDigit'
        },
        found2ndDigit: {
            '0': 'R addZero',
            '1': 'R addOne',
            '': 'R addOne'
        },
        addZero: {
            r: 'Ps addFinished',
            u: 'Pv addFinished',
            any: 'R R addZero'
        },
        addOne: {
            r: 'Pv addFinished',
            u: 'Ps R R carry',
            any: 'R R addOne',
        },
        carry: {
            r: 'Pu addFinished',
            '': 'Pu newDigitIsZero',
            u: 'Pr R R carry'
        },
        addFinished: {
            '@': 'R R eraseOldX',
            any: 'L L addFinished'
        },
        eraseOldX: {
            x: 'E L L printNewX',
            z: 'Py L L printNewX',
            any: 'R R eraseOldX'
        },
        printNewX: {
            '@': 'R R eraseOldY',
            y: 'Pz findDigits',
            '': 'Px findDigits'
        },
        eraseOldY: {
            y: 'E L L printNewY',
            any: 'R R eraseOldY'
        },
        printNewY: {
            '@': 'newDigitIsOne',
            any: 'Py R resetNewX'
        },
        resetNewX: {
            '': 'R Px flagResultDigits',
            'any': 'R R resetNewX'
        },
        flagResultDigits: {
            s: 'Pt R R unflagResultDigits',
            v: 'Pw R R unflagResultDigits',
            any: 'R R flagResultDigits'
        },
        unflagResultDigits: {
            s: 'Pr R R unflagResultDigits',
            v: 'Pu R R unflagResultDigits',
            any: 'findDigits'
        },
        newDigitIsZero: {
            '@': 'R printZeroDigit',
            any: 'L newDigitIsZero'
        },
        printZeroDigit: {
            '0': 'R E R printZeroDigit',
            '1': 'R E R printZeroDigit',
            '': 'P0 R R R cleanup'
        },
        newDigitIsOne: {
            '@': 'R printOneDigit',
            any: 'L newDigitIsOne'
        },
        printOneDigit: {
            '0': 'R E R printOneDigit',
            '1': 'R E R printOneDigit',
            '': 'P1 R R R cleanup'
        },
        cleanup: {
            '': 'new',
            'any': 'E R R cleanup'
        }
    };
}

// var states = fillWithZeros();
// var states = turingExample();
var states = multiply();

var stateName;

function setState(name) {
    if (name === stateName) return;
    if (!states[name]) throw "Unknown state '" + name + "'";
    stateName = name;
    stateNode.innerText = name;
    if (breakpoints[name]) stopping = true;
    if (breakOnNewState) {
        stopping = true;
        breakOnNewState = false;
    }
}

function setCurrent(cell) {
    if (!cell) throw "Whoah there";
    if (current) {
        current.classList.remove("current");
    }
    current = cell;
    current.classList.add("current");
}

function step() {
    if (!current) throw "Out of cells";
    var scanned = current.innerText;
    var state = states[stateName];
    if (!state) throw "No such state '" + stateName + "'";
    var rule = state[scanned];
    if (rule === undefined) rule = state["any"];
    if (rule === undefined) {
        throw "ERROR! no rule for scanned symbol '" + scanned + "'";
    }
    var commands = rule.split(" ");
    for (var i = 0; i < commands.length - 1; ++i) {
        var command = commands[i];
        if (command === "L") {
            setCurrent(current.previousElementSibling);
        } else if (command === "R") {
            setCurrent(current.nextElementSibling);
        } else if (command[0] === "P") {
            current.innerText = command.substr(1);
        } else if (command[0] === "E") {
            current.innerText = '';
        } else {
            throw "Bad command " + command;
        }
    }
    setState(commands[commands.length - 1]);
}

function init() {
    tm = document.getElementById("tm");
    var cell = document.getElementById("cell-template");
    for (var i = 0; i < 90; ++i) {
        var newCell = cell.cloneNode();
        newCell.removeAttribute("cell-template");
        tm.append(newCell);
        cells.push(newCell);
    }
    stateNode = document.getElementById('state');
    setState('begin');
    setCurrent(cells[0]);
    document.addEventListener("keydown", e => {
        switch (e.key) {
            case 'n':
                stepStateAnim();
                return false;
            case 'N':
                stepState();
                return false;
            case 'm':
                stopping = false;
                step();
                return false;
            case 's':
                stop();
                return false;
            case 'g':
                go(100);
                return false;
            case 'G':
                go(500);
                return false;
        }
    });
}

function go(timeout) {
    timeout = timeout || 200;
    stopping = false;
    function next() {
        step();
        if (!stopping) setTimeout(next, timeout);
    }

    next();
}

function stepState() {
    stopping = false;
    breakOnNewState = true;
    while (!stopping) step();
}

function stepStateAnim() {
    stopping = false;
    breakOnNewState = true;
    go(100);
}

function stop() {
    stopping = true;
}

function breakOn(func) {
    breakpoints[func] = true;
}