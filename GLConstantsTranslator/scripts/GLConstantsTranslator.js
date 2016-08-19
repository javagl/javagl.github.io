

var currentChunkUpdate;

var ChunkUpdate = function(min, size, table, result, text) {
    this.min = min;
    this.table = table;
    this.result = result;
    this.text = text;
    this.interrupted = false;

    if (min + size >= result.length) {
        this.max = result.length;
        //console.log("ChunkUpdate instantiated "+this.info());
        this.successor = undefined;
    } else {
        this.max = min + size;
        //console.log("ChunkUpdate instantiated "+this.info());
        this.successor = new ChunkUpdate(this.max, size, table, result, text);
    }
};

ChunkUpdate.prototype.info = function() {
    return this.min + " to " + this.max + " for " + this.text + ", status " + this.interrupted;
};

ChunkUpdate.prototype.execute = function() {

    var that = this;
    if (!this.interrupted) {
        //console.log("Executing  "+this.info());
        updateChunk(this.min, this.max, this.table, this.result);

        if ( typeof this.successor !== "undefined") {
            currentChunkUpdate = this.successor;

            //console.log("Schedule   "+currentChunkUpdate.info());
            setTimeout(function() {
                that.successor.execute();
            }, 100);
        } else {
            currentChunkUpdate = undefined;
        }
    } else {
        //console.log("Executing  "+this.info()+" was interrupted");
    }
};

function inputWasUpdated() {

    if ( typeof currentChunkUpdate !== "undefined") {
        //console.log("Interrupt  "+currentChunkUpdate.info());
        currentChunkUpdate.interrupted = true;
    }
    var text = this.value;
    var result = filterData(text);
    updateTable(result, text);
}

function updateTable(result, text) {
    var output = document.getElementById("output");
    output.innerHTML = '';

    var table = document.createElement("table");
    table.id = "data";

    var th0 = document.createElement("th");
    th0.className = "long";
    th0.appendChild(document.createTextNode("Constant Name"));
    table.appendChild(th0);

    var th1 = document.createElement("th");
    th1.appendChild(document.createTextNode("Decimal"));
    table.appendChild(th1);

    var th2 = document.createElement("th");
    th2.appendChild(document.createTextNode("Hexadecimal"));
    table.appendChild(th2);

    output.appendChild(table);

    currentChunkUpdate = new ChunkUpdate(0, 100, table, result, text);
    currentChunkUpdate.execute();
}

function updateChunk(min, max, table, result) {
    for (var i = min; i < max; i++) {
        var tr = document.createElement("tr");
        if (i % 2 === 0) {
            tr.className = "even";
        }

        var td0 = document.createElement("td");
        var txt0 = document.createTextNode(result[i].name);
        td0.appendChild(txt0);
        tr.appendChild(td0);

        var td1 = document.createElement("td");
        var txt1 = document.createTextNode(result[i].dec);
        td1.appendChild(txt1);
        tr.appendChild(td1);

        var td2 = document.createElement("td");
        var txt2 = document.createTextNode(result[i].hex);
        td2.appendChild(txt2);
        tr.appendChild(td2);

        table.appendChild(tr);
    }
}

function init() {
    document.getElementsByName("Input")[0].addEventListener('input', inputWasUpdated);
    document.getElementsByName("Input")[0].focus();
    updateTable(filterData(""), "");
}


var compareBy = function(property) {
    return function(a, b) {
        var aProperty = a[property];
        var bProperty = b[property];
        if (aProperty < bProperty) {
            return -1;
        } else if (aProperty > bProperty) {
            return 1;
        } else {
            return 0;
        }
    };
};

var filterData = function(input) {
    var searchString = input.toUpperCase();
    var comparator = function(a, b) {
        var matchpos = a.name.indexOf(searchString) - b.name.indexOf(searchString);
        if (matchpos === 0) {
            return compareBy("name")(a, b);
        } else {
            return matchpos;
        }
    };
    
    var theFilter = function(item) {
        return item.name.indexOf(searchString) !== -1;
    };
    if (input.startsWith("0x") || input.startsWith("0X")) {
        value = parseInt(input, 16);
        var searchString = input.toLowerCase();
        theFilter = function(item) {
            return item.hex.startsWith(searchString);
        };
        comparator = compareBy("hex");
    } else if (input.length != 0 && !isNaN(input)) {
        theFilter = function(item) {
            return item.dec.startsWith(input);
        };
        comparator = compareBy("dec");
    }
    var result = data.filter(theFilter);
    if (comparator) {
        result.sort(comparator);
    }

    return result;
};


