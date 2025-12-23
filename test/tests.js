QUnit.test('bsSelect Suchfunktion', function(assert) {
    var done = assert.async();
    var $select = $('<select id="mySelect" data-bs-toggle="select"><option value="1">Apple</option><option value="2">Banana</option><option value="3">Avocado</option><option value="4">Apricot</option></select>');
    $('body').append($select);

    $(document).ready(function() {
        $select.bsSelect();
        var $dropdown = $select.closest('.js-bs-select-dropdown');
        var $searchInput = $dropdown.find('.dropdown-menu input[type="search"]');

        // Test 1: Suche nach "Ap"
        $searchInput.val('Ap').trigger('input');
        setTimeout(function() {
            var $visibleItems = $dropdown.find('.dropdown-item:visible');
            assert.equal($visibleItems.length, 2, 'Zwei Elemente sichtbar (Apple, Apricot)');

            // Test 2: Suche nach "Banana"
            $searchInput.val('Banana').trigger('input');
            setTimeout(function() {
                $visibleItems = $dropdown.find('.dropdown-item:visible');
                assert.equal($visibleItems.length, 1, 'Ein Element sichtbar (Banana)');

                // Test 3: Suche nach "xyz" (kein Ergebnis)
                $searchInput.val('xyz').trigger('input');
                setTimeout(function() {
                    $visibleItems = $dropdown.find('.dropdown-item:visible');
                    assert.equal($visibleItems.length, 0, 'Kein Element sichtbar');

                    $select.bsSelect('destroy');
                    $select.remove();
                    done();

                }, 1000);
            }, 1000);
        }, 1000);
    });
});

QUnit.test('bsSelect vordefinierte Suche als Präfix (searchQuery Option)', function(assert) {
    var done = assert.async();
    var $select = $('<select id="predefinedSearchSelect"><option value="1">Apple</option><option value="2">Banana</option><option value="3">Avocado</option><option value="4">Apricot</option></select>');
    $('body').append($select);

    $(document).ready(function() {
        $select.bsSelect({
            searchQuery: 'Ap'
        });
        var $dropdown = $select.next('.js-bs-select-dropdown');
        
        // Da "Ap" der Präfix ist, sollten beim Start Apple und Apricot sichtbar sein
        var $visibleItems = $dropdown.find('.dropdown-item:visible');
        assert.equal($visibleItems.length, 2, 'Zwei Elemente sichtbar beim Start (Apple, Apricot)');

        var $prefixText = $dropdown.find('.input-group-text');
        assert.equal($prefixText.text(), 'Ap', 'Suchfeld-Präfix enthält "Ap"');

        var $searchInput = $dropdown.find('input[type="search"]');
        assert.equal($searchInput.val(), '', 'Das eigentliche Suchfeld ist leer');

        // Wenn wir "r" eingeben, sollte nach "Apr" gesucht werden (Apricot)
        $searchInput.val('r').trigger('input');
        $visibleItems = $dropdown.find('.dropdown-item:visible');
        assert.equal($visibleItems.length, 1, 'Nur noch Apricot sichtbar nach Eingabe von "r"');
        assert.equal($visibleItems.text().trim(), 'Apricot', 'Gefundenes Element ist Apricot');

        $select.bsSelect('destroy');
        $select.remove();
        done();
    });
});

QUnit.test('bsSelect programmatische Suche mit Präfix', function(assert) {
    var done = assert.async();
    var $select = $('<select id="programmaticSearchPrefixSelect" data-search-query="A"><option value="1">Apple</option><option value="2">Banana</option><option value="3">Avocado</option><option value="4">Apricot</option></select>');
    $('body').append($select);

    $(document).ready(function() {
        $select.bsSelect();
        var $dropdown = $select.next('.js-bs-select-dropdown');

        // Suche nach "v" (Präfix "A" + "v" = "Av")
        $select.bsSelect('search', 'v');
        var $visibleItems = $dropdown.find('.dropdown-item:visible');
        assert.equal($visibleItems.length, 1, 'Ein Element sichtbar nach programmatischer Suche "v" mit Präfix "A" (Avocado)');
        assert.equal($visibleItems.text().trim(), 'Avocado', 'Gefundenes Element ist Avocado');

        $select.bsSelect('destroy');
        $select.remove();
        done();
    });
});

QUnit.test('bsSelect vordefinierter Präfix via data-attribute', function(assert) {
    var done = assert.async();
    var $select = $('<select id="dataAttrSearchSelect" data-search-query="Avocado"><option value="1">Apple</option><option value="2">Banana</option><option value="3">Avocado</option><option value="4">Apricot</option></select>');
    $('body').append($select);

    $(document).ready(function() {
        $select.bsSelect();
        var $dropdown = $select.next('.js-bs-select-dropdown');
        var $visibleItems = $dropdown.find('.dropdown-item:visible');
        assert.equal($visibleItems.length, 1, 'Ein Element sichtbar beim Start (Avocado)');

        var $prefixText = $dropdown.find('.input-group-text');
        assert.equal($prefixText.text(), 'Avocado', 'Präfix enthält "Avocado"');

        $select.bsSelect('destroy');
        $select.remove();
        done();
    });
});

QUnit.test('bsSelect Suche mit Leerzeichen erlaubt', function(assert) {
    var done = assert.async();
    var $select = $('<select id="spaceSearchSelect"><option value="1">Apple Pie</option><option value="2">Banana</option></select>');
    $('body').append($select);

    $(document).ready(function() {
        $select.bsSelect();
        var $dropdown = $select.next('.js-bs-select-dropdown');
        var $searchInput = $dropdown.find('input[type="search"]');

        // Simuliere Leertaste (keydown)
        var event = $.Event('keydown');
        event.code = 'Space';
        $searchInput.trigger(event);

        assert.notOk(event.isDefaultPrevented(), 'Leertaste wurde NICHT unterbunden');

        // Simuliere Eingabe mit Leerzeichen
        $searchInput.val('Apple ').trigger('input');
        assert.equal($searchInput.val(), 'Apple ', 'Leerzeichen am Ende bleiben im Suchfeld erhalten');

        // Simuliere Eingabe nur Leerzeichen
        $searchInput.val('   ').trigger('input');
        assert.equal($searchInput.val(), '   ', 'Mehrere Leerzeichen bleiben im Suchfeld erhalten');

        $select.bsSelect('destroy');
        $select.remove();
        done();
    });
});

QUnit.test('bsSelect vordefinierte Suche bleibt nach Schließen erhalten', function(assert) {
    var done = assert.async();
    var $select = $('<select id="persistSearchSelect" data-search-query="Apple"><option value="1">Apple</option><option value="2">Banana</option></select>');
    $('body').append($select);

    $(document).ready(function() {
        $select.bsSelect();
        var $dropdown = $select.next('.js-bs-select-dropdown');
        var $searchInput = $dropdown.find('input[type="search"]');

        assert.equal($searchInput.val(), 'Apple', 'Initialer Suchwert ist "Apple"');

        // Suche ändern
        $searchInput.val('Banana').trigger('input');
        assert.equal($searchInput.val(), 'Banana', 'Suchwert auf "Banana" geändert');

        // Dropdown schließen simulieren
        $dropdown.trigger('hidden.bs.dropdown');

        setTimeout(function() {
            assert.equal($searchInput.val(), 'Apple', 'Nach dem Schließen ist der Suchwert wieder "Apple" (vordefiniert)');
            $select.bsSelect('destroy');
            $select.remove();
            done();
        }, 100);
    });
});