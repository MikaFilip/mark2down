var HTML;

QUnit.begin(function (details) {
    for (var n in __html__) {
        HTML = __html__[n];
        break;
    }
});

function putStringToEditorTest(input, position, expectedValue, existingValue) {
    QUnit.test("put string to editor", function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = existingValue;

        putStringToEditor(input, position);

        assert.equal(editor.value, expectedValue, "expected: '" + expectedValue + "'; result: '" + editor.value + "'");
    });
}

function cursorPositionTest(setPosition, expectPosition, existionValue) {
    QUnit.test("cursor position", function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = existionValue;

        setCursorPosition(setPosition);
        var result = getCursorPosition();
        assert.equal(result, expectPosition, "expected position is: '" + expectPosition + "'; result position is: '" + result + "'");
    });
}

function sendMarkdownTest(editorValue, expectedValue) {
    QUnit.test("Sever response and preview set", function (assert) {
        document.body.innerHTML = HTML;
        document.getElementById('editor').value = editorValue;
        var done = assert.async();
        sendMarkdown();
        setTimeout(function () {
            var result = document.getElementById('preview').innerHTML;
            assert.equal(result, expectedValue, "expected: '" + expectedValue + "'; result: '" + result + "'");
            done();
        }, 1000);
    });
}

function heightOfComponentsTest(windowHeight) {
    QUnit.test("computing height of components", function (assert) {
        document.body.innerHTML = HTML;
        var body = $('body');
        var content = $('#content');
        var height = body.height();
        body.innerHeight(windowHeight);
        $(window).resize();

        navResult = content.outerHeight() + $('#navigation').outerHeight();
        panelResult = $("#panel_contents").height() + $('#panel_buttons').height();
        if (windowHeight < 300) {
            windowHeight = 300;
        }
        navResult -= navResult-windowHeight;

        assert.equal(navResult, windowHeight);
        assert.equal(panelResult, content.height());
        body.outerWidth(height);
    });
}

function putCharTest(editorValue, inputValue, expectedValue, oldPosition, newPosition, expectedPosition) { //todo
    QUnit.test(" put char test", function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = editorValue;
        setCursorPosition(oldPosition);

        putChar(inputValue, newPosition);

        var resultPosition = getCursorPosition();
        var positionText = "expected position: " + expectedPosition + "; result: " + resultPosition;
        var valueText = "expected value: " + expectedValue + "; result: " + editor.value;
        assert.equal(resultPosition, expectedPosition, positionText);
        assert.equal(editor.value, expectedValue, valueText)
    });
}


function onChangeTest() {
    QUnit.test('on change test', function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = '';
        onChange();

        var done = assert.async();
        setTimeout(function () {

            var result = document.getElementById('preview').innerHTML;
            assert.equal(result, '');
            done();
        }, 2000);
    })
}

function hideShowComponentTest(idComponent) {
    QUnit.test('show or hide component', function (assert) {
        document.body.innerHTML = HTML;
        hideShowComponent(idComponent);

        var components = document.getElementsByClassName('panel-content');
        var bool = false;
        for (var i = 0; i < components.length; i++) {
            if (components[i].id == idComponent) {
                bool = true;
            } else {
                bool = false;
            }
            assert.equal($('#' + components[i].id).css('display') != 'none', bool, 'component ' + components[i].id + ' is visible: ' + bool);
        }
    });
}

function tabTest(){
    QUnit.test('function of tab', function (assert) {
        document.body.innerHTML = HTML;

        initTab();

        var editor = document.getElementById('editor');
        keyvent.on(editor).down(9);

        assert.equal(editor.value, '\t')

    });
}

tabTest();

putStringToEditorTest('', 0, '', '');
putStringToEditorTest('', 0, 'existingValue', 'existingValue');
putStringToEditorTest('test', 0, 'test', "");
putStringToEditorTest('test', 1, 'test', "");
putStringToEditorTest('test', 0, 'testexistingValue', "existingValue");
putStringToEditorTest('test', 3, 'exiteststingValue', "existingValue");
putStringToEditorTest('test', -10, 'testexistingValue', "existingValue");
putStringToEditorTest('test', 13, 'existingValuetest', "existingValue");
putStringToEditorTest(' ', 8, 'existing Value', "existingValue");

cursorPositionTest(0, 0, "");
cursorPositionTest(10, 0, "");
cursorPositionTest(0, 0, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(10, 10, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(30, 30, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(31, 30, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(-200, 0, "abcde fg hijkl mnop qrstuvwxyz");

sendMarkdownTest('', '');
sendMarkdownTest('test', '\n\n            '); //todo

onChangeTest();


heightOfComponentsTest(1000);
heightOfComponentsTest(301);
heightOfComponentsTest(300);
heightOfComponentsTest(299);
heightOfComponentsTest(1);
heightOfComponentsTest(-1);

putCharTest('existingValue', 'test', 'existingtestValue', 8, 2, 10);
putCharTest('', '', '', 0, 0, 0);
putCharTest('', '', '', 1, 10, 0);
putCharTest('', 'test', 'test', 0, 1, 1);
putCharTest('', 'test', 'test', 3, 1, 1);
putCharTest('existingValue', '', 'existingValue', 13, 0, 13);
putCharTest('existingValue', 'test', 'existingValuetest', 13, 10, 17);
putCharTest('existingValue', 'test', 'testexistingValue', -100, 10, 10);

hideShowComponentTest('toc');
hideShowComponentTest('comments');
hideShowComponentTest('repository');
