require('./thirdparty/MIDI.js');

window.onload = function () {
    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: "acoustic_grand_piano",
    });
}

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var ac = new AudioContext()


var staffImage = new Image();

//drawing of the test image - staffImage
staffImage.onload = resetPage;


const STAFFWIDTH = 800;
const STAFFHEIGHT = 40;
//draw a staff starting at top left (startX, startY)
function drawStaffLines(startX, startY) {
    for (var y = 0; y < 5; y++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + y * STAFFHEIGHT/4);
        ctx.lineTo(startX + STAFFWIDTH, startY + y * STAFFHEIGHT/4);
        ctx.stroke();
    }
    for (var x = 1; x <= 4; x++) {
        ctx.beginPath();
        ctx.moveTo(startX + x * STAFFWIDTH / 4, startY);
        ctx.lineTo(startX + x * STAFFWIDTH / 4, startY + STAFFHEIGHT);
        ctx.stroke();
    }
}

staffImage.src = 'assets/img/staff.png';

var previewNotes = false;

function addNoteButton() {
    previewNotes = !previewNotes;
}

//generate places where notes can go
let LEFT_X = 125;
let RIGHT_X = 925;
let TOP_Y = 100;
let BOTTOM_Y = 140;
var preview_notes = [];
for (var y = TOP_Y; y <= BOTTOM_Y; y+=((BOTTOM_Y - TOP_Y) / 8)) {
    for (var x = LEFT_X; x < RIGHT_X; x += (RIGHT_X - LEFT_X) / 16) {
        preview_notes.push([x, y]);
    }
}

var addedNotes = [];

//reset the page to a blank staff
function resetPage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStaffLines(100, 100);
    for (note in addedNotes) {
        drawNote(addedNotes[note][0], addedNotes[note][1], "black");
    }
}

// draw a single note at x,y
function drawNote(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

// preview the note with the cursor
const MIN_PREVIEW_DIST = 2500;

function previewNote(event) {
    if (previewNotes) {
        // find the closest point to select on the page
        var closest = preview_notes[0];
        var closestDist = (event.offsetX - closest[0])* (event.offsetX - closest[0])
            + (event.offsetY - closest[1]) * (event.offsetY - closest[1]);

        for (index in preview_notes) {
            newDist = (event.offsetX - preview_notes[index][0])* (event.offsetX - preview_notes[index][0])
                + (event.offsetY - preview_notes[index][1]) * (event.offsetY - preview_notes[index][1]);

            if (newDist < closestDist) {
                closest = preview_notes[index];
                closestDist = newDist;
            }
        }

        if (closestDist < MIN_PREVIEW_DIST) {
            resetPage();
            drawNote(closest[0], closest[1],"#a9acb2");
        }
        else {
            resetPage();
        }
    }
}

// add a note permanently to the page
function addNote(event) {
    if (previewNotes) {
        var closest = preview_notes[0];
        var closestDist = (event.offsetX - closest[0])* (event.offsetX - closest[0])
            + (event.offsetY - closest[1]) * (event.offsetY - closest[1]);

        for (index in preview_notes) {
            newDist = (event.offsetX - preview_notes[index][0])* (event.offsetX - preview_notes[index][0])
                + (event.offsetY - preview_notes[index][1]) * (event.offsetY - preview_notes[index][1]);

            if (newDist < closestDist) {
                closest = preview_notes[index];
                closestDist = newDist;
            }
        }

        if (closestDist < MIN_PREVIEW_DIST) {
            addedNotes.push([closest[0], closest[1]]);
            drawNote(closest[0], closest[1], "black");
            var C4height = 115;
            var note = 60 - (closest[1] - C4height) / (STAFFHEIGHT / 8);
            var delay = 0; // play one note every quarter second
            var velocity = 127; // how hard the note hits
            // play the note
            MIDI.setVolume(0, 127);
            MIDI.noteOn(0, note, velocity, delay);
            MIDI.noteOff(0, note, delay + 1);
        }
    }
}

function playNotes(event) {
    // for (index in addedNotes) {

    // }
}

document.getElementById("addButton").addEventListener('click', addNoteButton);
document.getElementById("playButton").addEventListener('click', playNotes);
canvas.addEventListener('mousemove', previewNote, false);
canvas.addEventListener('mousedown', addNote, false);