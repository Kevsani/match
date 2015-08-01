
var w = window
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('html')[0],
    screenWidth = w.innerWidth || e.clientWidth || g.clientWidth,
    screenHeight = w.innerHeight || e.clientHeight || g.clientHeight;
var border = 5;

function hookEvent(element, eventName, callback) {
    if (typeof (element) == "string")
        element = document.getElementById(element);
    if (element == null)
        return;
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    }
    else if (element.attachEvent)
        element.attachEvent("on" + eventName, callback);
}

function unhookEvent(element, eventName, callback) {
    if (typeof (element) == "string")
        element = document.getElementById(element);
    if (element == null)
        return;
    if (element.removeEventListener)
        element.removeEventListener(eventName, callback, false);
    else if (element.detachEvent)
        element.detachEvent("on" + eventName, callback);
}

function cancelEvent(e) {
    e = e ? e : window.event;
    if (e.stopPropagation)
        e.stopPropagation();
    if (e.preventDefault)
        e.preventDefault();
    e.cancelBubble = true;
    e.cancel = true;
    e.returnValue = false;
    return false;
}

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
function absoluteCursorPostion(eventObj) {
    eventObj = eventObj ? eventObj : window.event;
    if (eventObj.changedTouches)              //Added line
        eventObj = eventObj.changedTouches[0];  //Added line - only care about the first touch

    if (isNaN(window.scrollX))
        return new Position(eventObj.clientX + document.documentElement.scrollLeft + document.body.scrollLeft,
          eventObj.clientY + document.documentElement.scrollTop + document.body.scrollTop);
    else
        return new Position(eventObj.clientX + window.scrollX, eventObj.clientY + window.scrollY);
}
function dragElement(element, position, size) {
    var lowerBound = new Position(0, 0);
    var upperBound = new Position(screenWidth - size.X, screenHeight - size.Y);
    var attachElement = null;
    var attachLater = false;
    this.objSize = size;
    this.class = "#" + element;
    $("#" + element).draggable({ revert: "invalid" });
    this.revert = $("#" + element).draggable("option", "revert");
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
    var cursorStartPos = null;
    var elementStartPos = null;
    var dragging = false;
    var listening = false;
    var disposed = false;

    function dragStart(eventObj) {
        if (dragging || !listening || disposed) return;
        dragging = true;
        cursorStartPos = absoluteCursorPostion(eventObj);
        elementStartPos = new Position(parseInt(element.style.left), parseInt(element.style.top));
        elementStartPos = elementStartPos.Check();

        hookEvent(document, "mousemove", dragGo);
        hookEvent(document, "touchmove", dragGo);  //Added line
        hookEvent(document, "mouseup", dragStopHook);
        hookEvent(document, "touchend", dragStopHook);  //Added line

        return cancelEvent(eventObj);
    }

    function dragGo(eventObj) {
        if (!dragging || disposed) return;

        var newPos = absoluteCursorPostion(eventObj);
        newPos = newPos.Add(elementStartPos).Subtract(cursorStartPos);
        newPos = newPos.Bound(lowerBound, upperBound)
        newPos.Apply(element);
        return cancelEvent(eventObj);
    }

    function dragStopHook(eventObj) {
        dragStop();
        return cancelEvent(eventObj);
    }

    function dragStop() {
        if (!dragging || disposed) return;
        unhookEvent(document, "mousemove", dragGo);
        unhookEvent(document, "touchmove", dragGo);  //Added line
        unhookEvent(document, "mouseup", dragStopHook);
        unhookEvent(document, "touchend", dragStopHook);  //Added line
        cursorStartPos = null;
        elementStartPos = null;
        dragging = false;
    }

    this.Dispose = function () {
        if (disposed) return;
        this.StopListening(true);
        element = null;
        attachElement = null
        lowerBound = null;
        upperBound = null;      
        disposed = true;
    }

    this.StartListening = function () {
        if (listening || disposed) return;
        listening = true;
        hookEvent(attachElement, "mousedown", dragStart);
        hookEvent(attachElement, "touchstart", dragStart);  //Added line
    }

    this.StopListening = function (stopCurrentDragging) {
        if (!listening || disposed) return;
        unhookEvent(attachElement, "mousedown", dragStart);
        unhookEvent(attachElement, "touchstart", dragStart);  //Added line
        listening = false;
        if (stopCurrentDragging && dragging)
            dragStop();
    }

    this.square = function (width) {
        element.style.width = width + "px";
        element.style.height = width + "px";
    }
    this.IsDragging = function () { return dragging; }
    this.IsListening = function () { return listening; }
    this.IsDisposed = function () { return disposed; }

    if (typeof (attachElement) == "string")
        attachElement = document.getElementById(attachElement);
    if (attachElement == null)
        attachElement = element;
    if (!attachLater)
        this.StartListening();
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
    $(function () {
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
                    left: parseFloat(d.getElementById('droppable').style.left) + border,
                    top: parseFloat(d.getElementById('droppable').style.top) + border
                }, {
                    duration: 600,
                    step: function (now, fx) {
                        $(".block:gt(0)").css("left", now);
                    }
                });
            }
        });
    });
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

