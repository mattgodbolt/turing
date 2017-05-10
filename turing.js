window.onload = function () {
    init();
};

var tm;
var cells = [];
var current = null;
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
            'any': "R R q",
            '': 'P1 L p'
        },
        p: {
            x: 'E R q',
            e: 'R f',
            '': 'L L p'
        },
        f: {
            'any': "R R f",
            '': 'P0 L L o'
        }
    };
}

var states = turingExample();

var stateName;

function setState(name) {
    if (!states[name]) throw "Unknown state '" + name + "'";
    stateName = name;
    stateNode.innerText = name;
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
    console.log("In state", "'" + stateName + "'", "scanned", "'" + scanned + "'");
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
    for (var i = 0; i < 100; ++i) {
        var newCell = cell.cloneNode();
        newCell.removeAttribute("cell-template");
        tm.append(newCell);
        cells.push(newCell);
    }
    stateNode = document.getElementById('state');
    setState('begin');
    setCurrent(cells[0]);
}

function go(timeout) {
    timeout = timeout || 200;
    function next() {
        step();
        setTimeout(next, timeout);
    }

    next();
}