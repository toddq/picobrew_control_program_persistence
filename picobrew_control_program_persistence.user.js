// ==UserScript==
// @name         Picobrew Control Program Persistence
// @namespace    https://github.com/toddq
// @version      0.2
// @description  Allow saving and re-using control programs in Picobrew's 'Advanced Editor'
// @author       Todd Quessenberry
// @match        https://picobrew.com/members/recipes/editctlprogram*
// @require      https://www.gstatic.com/firebasejs/live/3.0/firebase.js
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_listValues
// @grant GM_deleteValue
// ==/UserScript==

var $controls;
var $programList;
var $nameField;
var cloudUrl;

(function() {
    'use strict';

    $('#generalWarning').modal('hide');
    addControls();

    initializeUser()
        .then(migrateData)
        .then(loadProgramList);
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
    $.get(cloudUrl + '.json')
        .then(function (response) {
            $.each(response, function (key, value) {
                console.debug(key, ':', value);
                addToProgramList(key, value);
            });
        })
        .fail(function (error) {
            console.error(error);
        });
}

function migrateData () {
    console.debug('migrating data');
    var local = GM_listValues();
    var migrations = [];
    console.debug('local values: ', local);
    $.each(local, function (index, name) {
        if (name !== 'userUuid') {
            console.debug('migrating ', name);
            var program = JSON.parse(GM_getValue(name));
            var migration = saveProgram(program)
                .then(function () {
                    console.debug(name, 'saved.  deleting now.');
                    GM_deleteValue(name);
                });
            migrations.push(migration);
        }
    });
    return $.when.apply($, migrations)
        .then(function () {
            if (migrations.length) {
                showVersionUpgradeMessage();
                console.debug('done migrating all data');
            }
        });
}

function addToProgramList(name, value) {
    var option = $('<option>' + name + '</option>').data('value', value);
    $programList.append(option);
}

function loadSavedProgram() {
    var selectedName = $programList.val();
    if (selectedName) {
        var program = $($programList.find(':selected')).data('value');
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
    saveProgram(program)
        .then(function (response) {
            console.debug('response: ', response);
            showSaveSuccess();
            addToListAndSelect(program);
        }).fail(function (error) {
            console.error(error);
        });
}

function saveProgram (program) {
    return $.ajax({
        method: 'PUT',
        url: cloudUrl + '/' + program.name + '.json',
        data: JSON.stringify(program)
    });
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

function addToListAndSelect(program) {
    var listItem = $programList.find('option:contains(' + program.name + ')');
    if (listItem.length) {
        listItem.data('value', program);
    } else {
        addToProgramList(program.name, program);
    }
    $programList.val(program.name);
}

function initializeUser() {
    console.debug('initializing user');
    return getUserId()
        .then(function (userId) {
            console.debug('got userId:', userId, ', setting cloud url');
            cloudUrl = 'https://pb-control-programs.firebaseio.com/users/' + userId + '/control-programs';
        });
}

function getUserId() {
    console.debug('getting user id');
    var userUuid = GM_getValue('userUuid');

    if (!userUuid || userUuid === 'undefined') {
        console.debug('scraping web page for user id');
        return $.get('/Members/User/Brewhouse.cshtml')
            .then(function (data) {
                var $data = $('<div>').html(data);
                var $user = $data.find('#user');
                if ($user && $user.val()) {
                    userUuid = $user.val();
                    console.log('storing userid:', userUuid);
                    GM_setValue('userUuid', userUuid);
                    return userUuid;
                }
            })
            .fail(function (error) {
                console.error(error);
            });
    }
    return $.when(userUuid);
}

function showVersionUpgradeMessage() {
    $('#generalWarning #msgBod').text('Your saved programs have been migrated to the cloud.  You can now access them from any browser running this Userscript.');
    $('#generalWarning #myModalLabel').text('');
    $('#generalWarning #msgBod').addClass('bg-success');
    $('#generalWarning').modal('show');
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