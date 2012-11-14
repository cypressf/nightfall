// Cypress Library
(function(){
    // object we'll store our functions in
    var library = {};

    library.print = function(s) {
        console.log(s);
    };

    var debug_flag = true;

    library.debug = function(s) {
        if ( debug_flag ) {
            console.debug(s);
        }
    }

    library.set_debug = function(bool) {
        debug_flag = bool;
    }

    library.get_debug = function() {
        return debug_flag;
    }

    // put it in the global namespace
    window._ = library;
})();

var world = {
    height: 20,

    width: 20,

    players: [],

    grid: [],

    player: {
        name: "",
        tokens: []
    },

    square: {
        occupied: false,
        get_color: function(){
            _.debug(this);
            return this.occupied && this.occupied.color || "#fff";
        },
        get_name: function(){
            _.debug(this);
            return this.occupied && this.occupied.name || "empty";
        },
    },

    token: {
        name: "new token",
        head: [0, 1],
        tail: [],
        max_length: 1,
        attack: 1,
        range: 1,
        speed: 1,
        color: "#444"
    },

    initialize: function() {
        for (var x = 0; x < this.width; x++) {
            this.grid[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.grid[x][y] = Object.create(this.square);
            }
        }
        var mega = Object.create(this.token);
        mega.name = "Mega";
        mega.attack = 5;
        mega.head = [0, 0];
        this.grid[0][0].occupied = mega;

        var bitty = Object.create(this.token);
        bitty.name = "Bitty";
        bitty.speed = 5;
        bitty.head = [5, 5];
        this.grid[19][19].occupied = bitty;


        if (!this.table) {
            _.debug("initializing table for world");
            var t = document.createElement("table");
            t.setAttribute("id", "game-table");
            document.getElementById("game").appendChild(t);
            this.table = t;
        };
    },

    draw: function() {
        _.debug("drawing " + this.width + " x " + this.height);

        // string that will be the HTML table
        var table_string = "";

        // loop through the entire height and width
        for (var h = 0; h < this.height; h++) {

            // start a new table row
            table_string += "<tr>\n";

            // every column in that row
            for (var w = 0; w < this.width; w++) {

                // let's get the game square at that coordinate
                var coords = {h: h, w: w};
                var square = this.get_square(coords);

                // make sure the square is occupied before checking
                // for its color. default to #fff
                var color = square.get_color();
                var name = square.get_name();
                table_string += "<td style='background:"+color+"'><span class='name'>"+name+"</span></td> ";
            }
            table_string += "</tr>\n";
        }
        this.table.innerHTML = table_string;
    },

    // translates from a h, w pair (when building HTML DOM)
    // to a grid[x][y]
    get_square: function(coords) {
        var y = this.height - (coords.h + 1);
        var x = coords.w;
        return this.grid[x][y];
    }
}

world.initialize();
world.draw();