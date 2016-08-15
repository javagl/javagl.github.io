


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

var translate = function(input) {
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
        true;
    };
    theFilter = function(item) {
        return item.name.indexOf(searchString) !== -1;
    };
    if (input.startsWith("0x") || input.startsWith("0X")) {
        value = parseInt(input, 16);
        var searchString = input.toLowerCase();
        theFilter = function(item) {
            return item.hex.startsWith(searchString);
        };
        comparator = compareBy("hex");
    } else {
        if (!isNaN(parseInt(input, 10))) {
            theFilter = function(item) {
                return item.dec.startsWith(input);
            };
            comparator = compareBy("dec");
        }
    }
    var result = data.filter(theFilter);
    if (comparator) {
        result.sort(comparator);
    }

    return result;
};


