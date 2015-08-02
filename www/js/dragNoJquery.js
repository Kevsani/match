
var w = window
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('html')[0],
    screenWidth = w.innerWidth || e.clientWidth || g.clientWidth,
    screenHeight = w.innerHeight || e.clientHeight || g.clientHeight;
var border = 5;

function Position(x, y) {
    this.X = x;
    this.Y = y;

    this.Add = function (val) {
        var newPos = new Position(this.X, this.Y);
        if (val != null) {
            if (!isNaN(val.X))
                newPos.X += val.X;
            if (!isNaN(val.Y))
                newPos.Y += val.Y
        }
        return newPos;
    }

    this.Subtract = function (val) {
        var newPos = new Position(this.X, this.Y);
        if (val != null) {
            if (!isNaN(val.X))
                newPos.X -= val.X;
            if (!isNaN(val.Y))
                newPos.Y -= val.Y
        }
        return newPos;
    }

    this.Min = function (val) {
        var newPos = new Position(this.X, this.Y)
        if (val == null)
            return newPos;

        if (!isNaN(val.X) && this.X > val.X)
            newPos.X = val.X;
        if (!isNaN(val.Y) && this.Y > val.Y)
            newPos.Y = val.Y;

        return newPos;
    }

    this.Max = function (val) {
        var newPos = new Position(this.X, this.Y)
        if (val == null)
            return newPos;

        if (!isNaN(val.X) && this.X < val.X)
            newPos.X = val.X;
        if (!isNaN(val.Y) && this.Y < val.Y)
            newPos.Y = val.Y;

        return newPos;
    }

    this.Bound = function (lower, upper) {
        var newPos = this.Max(lower);
        return newPos.Min(upper);
    }

    this.Check = function () {
        var newPos = new Position(this.X, this.Y);
        if (isNaN(newPos.X))
            newPos.X = 0;
        if (isNaN(newPos.Y))
            newPos.Y = 0;
        return newPos;
    }

    this.Apply = function (element) {
        if (typeof (element) == "string")
            element = document.getElementById(element);
        if (element == null)
            return;
        if (!isNaN(this.X))
            element.style.left = this.X + 'px';
        if (!isNaN(this.Y))
            element.style.top = this.Y + 'px';
    }
}

function dragElement(element, position, size) {
    var lowerBound = new Position(0, 0);
    var upperBound = new Position(screenWidth - size.X, screenHeight - size.Y);
    var attachElement = null;
    var attachLater = false;
    this.objSize = size;
    this.class = "#" + element;
    //$("#" + element).draggable({ revert: "invalid" });
    //this.revert = $("#" + element).draggable("option", "revert");
    if (typeof (element) == "string")
        element = document.getElementById(element);
    if (element == null)
        return;
    element.style.width = size.X + "px";
    element.style.height = size.Y + "px";
    element.style.left = (screenWidth - size.X) * (.01 * position.X) + "px";
    element.style.top = (screenHeight - size.Y) * (.01 * position.Y) + "px";
    if (lowerBound != null && upperBound != null) {
        var temp = lowerBound.Min(upperBound);
        upperBound = lowerBound.Max(upperBound);
        lowerBound = temp;
    }
    
}
function dropElement(element, dragObj, position) {
    if (typeof (element) == "string")
        element = document.getElementById(element);
    if (element == null)
        return;
    element.style.width = dragObj.objSize.X + "px";
    element.style.height = dragObj.objSize.Y + "px";
    element.style.left = (screenWidth - dragObj.objSize.X) * (.01 * position.X) + "px";
    element.style.top = (screenHeight - dragObj.objSize.Y) * (.01 * position.Y) + "px";
    /*$(function () {
        $(element).droppable({
            accept: dragObj.class,
            activeClass: "ui-state-default",
            hoverClass: "ui-state-hover",
            drop: function (event, ui) {
                $(this)   
                  .addClass("ui-state-highlight")
                  .find("p")
                    .html("Dropped!");
                dragObj.revert = "invalid";
                $(this)
                $(dragObj.class).draggable("option", "revert", false); //make dragObj stay in its new spot
                $(dragObj.class).animate({
                    left: parseFloat(element.style.left) + border,
                    top: parseFloat(element.style.top) + border
                }, {
                    duration: 600,
                    step: function (now, fx) {
                        $(".block:gt(0)").css("left", now);
                    }
                });
            }
        });
    });*/
}
function Size(x, y) {
    this.X = x;
    this.Y = y;

    if (y == null) {
        this.X = screenWidth * (.01 * this.X);
        this.Y = this.X;
    } else {
        this.X = screenWidth * (.01 * this.X);
        this.Y = screenHeight * (.01 * this.Y);
    }
}

