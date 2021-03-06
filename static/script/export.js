/**
 * Contains all annotation it document.
 * @type {Array}
 */
var annotation = [];

/**
 * Initialize #printDialog.
 */
function initPrintDialog() {
    $('#printDialog').dialog({
        autoOpen: false,
        resizable: true,
        modal: true
    })
}

/**
 * Call createExportDialogCheckboxes, set button to #printDialog and open it. If array annotations is empty, function
 * only call printPreview().
 */
function printDocument() {
    if (annotation.length == 0) {
        printPreview();
    } else {
        createExportDialogCheckboxes();
        var printDialog = $('#printDialog');
        printDialog.dialog({
            buttons: {
                'Print': function () {
                    printPreview();
                    $(this).dialog('close');
                }
            },
            title: 'Print'
        });
        printDialog.dialog('open');
    }
}

/**
 * Call createExportDialogCheckboxes, set button to #printDialog and open it. If array annotations is empty, function
 * only call exportPreview().
 */
function exportDocument() {
    if (annotation.length == 0) {
        exportPreview();
    } else {
        createExportDialogCheckboxes();
        var printDialog = $('#printDialog');
        printDialog.dialog({
            buttons: {
                'Export': function () {
                    exportPreview();
                    $(this).dialog('close');
                }
            },
            title: 'Export'

        });
        printDialog.dialog('open');
    }
}

/**
 * Open preview in new window and call print.
 */
function printPreview() {
    var checkboxes = getCheckedAnnotation();
    finalPreview('help', checkboxes, false);

    setTimeout(function () {
        var win = window.open("", "Print", "");
        win.document.write('<html><head><title>print</title>');
        win.document.write('<meta charset="UTF-8">');
        if (loadMermaid) {
            win.document.write('<script src="/static/mermaid/mermaid.min.js"></script>');
            win.document.write('<link rel="stylesheet" href="/static/mermaid/mermaid.css">');
            win.document.write('<script>mermaid.init(undefined, ".mermaid");</script>');
        }
        $.post('/get-css', function (data) {
            win.document.write("<style>" + encodeURIComponent(data) + "</style>");
            win.document.write('</head><body>');
            win.document.write(document.getElementById('help').innerHTML);
            win.document.write('</body></html>');

            win.document.close(); // for IE
            win.focus(); // for IE

            document.getElementById('help').innerHTML = '';
            setTimeout(function () {
                win.print();
                win.close();
            }, 100);
        });
    }, 1000);
}

/**
 * Show download dialog to download html of markdown code.
 */
function exportPreview() {
    var checkboxes = getCheckedAnnotation();
    finalPreview('help', checkboxes, false); // load data from server

    setTimeout(function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.download = "export.html";
        var helpDiv = $('#help');
        helpDiv.css('display', 'block'); // must be visible because of mermaid
        if (loadMermaid) {
            mermaid.init(undefined, ".mermaid");
        }

        $.when($.post("/get-css"))
            .done(function (data) {
                var text = "data:text/html,";
                text += "<html><head><title>export</title><meta charset=\"UTF-8\"><style>";
                text += encodeURIComponent(data) + "</style></head><body>";
                text += encodeURIComponent(document.getElementById("help").innerHTML) + "</body></html>";
                console.log(text);
                a.href = text;
                a.click();
                helpDiv.css('display', 'none');
                document.body.removeChild(a);
                document.getElementById('help').innerHTML = ''; // clear help div
            });
    }, 1000);
}

/**
 * Return array which contains annotations which are checked in #printDialog.
 * @returns {Array} checked annotation in #printDialog.
 */
function getCheckedAnnotation() {
    var index = 0;
    var checkboxes = [];
    do {
        var checkbox = document.getElementById('checkbox' + index);
        if (checkbox != null) {
            if (checkbox.checked) {
                checkboxes.push(annotation[index]);
            }
            index++;
        }
    } while (checkbox != null);

    return checkboxes;
}

/**
 * Add form to #printDialog which contains checkboxes which are defined in annotation array.
 */
function createExportDialogCheckboxes() {
    var f = document.createElement('form');
    for (var index = 0; index < annotation.length; index++) {
        var l = document.createElement('label');
        var i = document.createElement('input');
        i.setAttribute('type', "checkbox");
        i.setAttribute('id', 'checkbox' + index);
        l.appendChild(i);
        l.innerHTML += annotation[index];
        f.appendChild(l);
        f.appendChild(document.createElement('br'))
    }

    var label = document.createElement('p');
    label.innerHTML = '<Strong>Select excluded annotations</Strong>';
    label.setAttribute('style', 'margin-bottom : 10px;');
    document.getElementById('printDialog').innerHTML = '';
    document.getElementById('printDialog').appendChild(label);
    document.getElementById('printDialog').appendChild(f);
}