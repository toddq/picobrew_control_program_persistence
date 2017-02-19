// ==UserScript==
// @name         Picobrew Control Program Persistence
// @namespace    https://gist.github.com
// @version      0.1
// @description  Allow saving and re-using control programs in Picobrew's 'Advanced Editor'
// @author       Todd Quessenberry
// @match        https://picobrew.com/members/recipes/editctlprogram*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_listValues
// ==/UserScript==

var $controls;
var $programList;
var $nameField;

(function() {
    'use strict';
    $('#generalWarning').modal('hide');
    addControls();
    loadProgramList();
})();

function addControls() {
    $controls = $('<div id="control_program_persistence" style="border: solid 1px; padding: 5px; position: absolute; left: 775px;">');
    $controls.html('<h5>Save and Load control programs <em>independently</em> of recipes.</h5>');
    $controls.append('<hr>');
    $('#stepTable').before($controls);

    addProgramLoadControls();
    addProgramSaveControls();
}

function addProgramLoadControls() {
    $programList = $('<select class="form-control" id="program_list" style="width: 300px" required="">');
    $programList.append('<option disabled="" selected=""></option>');

    var $load = $('<button class="btn btn-default" style="margin-left: 10px;">Load</button>');
    $load.click(loadSavedProgram);

    $controls.append($('<div class="form-group">')
                .append($('<label for="name">Saved Programs</label>')
                   .append($programList))
                .append($load));
}

function addProgramSaveControls() {
    $nameField = $('<input type="text" class="form-control" style="width: 300px;" id="name">');

    var $save = $('<button class="btn btn-default" style="margin-left: 10px;">Save</button>');
    $save.click(saveCurrentValues);

    $controls.append($('<div class="form-group">')
                 .append($('<label for="name">Control Program Name:</label>')
                     .append($nameField))
                 .append($save));
}

function loadProgramList() {
    var all = GM_listValues();
    $.each(all, function () {
        addToProgramList(this);
    });
}

function addToProgramList(name) {
    $programList.append('<option>' + name + '</option>');
}

function loadSavedProgram() {
    var selectedName = $programList.val();
    if (selectedName) {
        var program = JSON.parse(GM_getValue(selectedName));
        $nameField.val(program.name);
        $.each(program.formValues, function (index, step) {
            $.each(step, function (key, value) {
                $('input[name=' + key + ']').val(value);
            });
        });
    }
}

function saveCurrentValues() {
    var program = scrapeForm();
    GM_setValue(program.name, JSON.stringify(program));
    showSaveSuccess();
    addToListAndSelect(program.name);
}

function scrapeForm() {
    var program = {
        name: $nameField.val(),
        formValues: []
    };
    if (!program.name) {
        alert('Please enter a name to save this program with.');
        return;
    }
    $.each($('#stepTable tr'), function () {
        var step = {};
        $.each($(this).find('input, select'), function () {
            var $input = $(this);
            step[$input.attr('name')] = $input.val();
        });
        if (!$.isEmptyObject(step)) {
            program.formValues.push(step);
        }
    });
    return program;
}

function addToListAndSelect(name) {
    if (!$programList.find('option:contains(' + name + ')').length) {
        addToProgramList(name);
    }
    $programList.val(name);
}

function showSaveSuccess() {
    $('#generalWarning #msgBod').text('Program saved successfully');
    $('#generalWarning #myModalLabel').text('');
    $('#generalWarning #msgBod').addClass('bg-success');
    $('#generalWarning').modal('show');
    setTimeout(function () {
        $('#generalWarning').modal('hide');
    }, 1000);
}
