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
