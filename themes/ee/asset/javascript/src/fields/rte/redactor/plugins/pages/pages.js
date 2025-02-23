(function($R)
{
    $R.add('plugin', 'pages', {
        init: function(app)
        {
            this.app = app;
            this.opts = app.opts;
            this.$doc = app.$doc;
            this.$body = app.$body;
            this.editor = app.editor;
            this.marker = app.marker;
            this.keycodes = app.keycodes;
            this.container = app.container;
            this.selection = app.selection;

            // local
            this.handleTrigger = (typeof this.opts.handleTrigger !== 'undefined') ? this.opts.handleTrigger : '@';
            this.handleStart = (typeof this.opts.handleStart !== 'undefined') ? this.opts.handleStart : 3;
            this.handleStr = '';
            this.handleLen = this.handleStart;
        },
        // public
        start: function()
        {
            if (!this.opts.handle) return;

            var $editor = this.editor.getElement();
			$editor.on('keyup.redactor-plugin-handle', this._handle.bind(this));
            $editor.on('keydown.redactor-plugin-handle', this._listen.bind(this));
		},
		stop: function()
		{
            var $editor = this.editor.getElement();

			$editor.off('.redactor-plugin-handle');
            this.$doc.off('.redactor-plugin-handle');

            var $list = $R.dom('#redactor-handle-list');
            $list.remove();
		},

		// private
		_handle: function(e)
		{
    		var key = e.which;
			var ctrl = e.ctrlKey || e.metaKey;
			var arrows = [37, 38, 39, 40];

            if (key === this.keycodes.BACKSPACE)
            {
                if (this._isShown() && (this.handleLen > this.handleStart))
                {
                    this.handleLen = this.handleLen - 2;
                    if (this.handleLen <= this.handleStart)
                    {
                        this._hide();
                    }
                }
                else
                {
                    return;
                }
            }

			if (key === this.keycodes.DELETE
			    || key === this.keycodes.ESC
			    || key === this.keycodes.SHIFT
			    || ctrl
			    || (arrows.indexOf(key) !== -1)
			)
			{
				return;
			}

            var re = new RegExp('^' + this.handleTrigger);
            this.handleStr = this.selection.getTextBeforeCaret(this.handleLen + 1);

            // detect
            if (re.test(this.handleStr))
            {
                this.handleStr = this.handleStr.replace(this.handleTrigger, '');
                this.handleLen++;

                this._load();
            }
		},
        _listen: function(e) {
            var key = e.which;
            var ks = this.keycodes;

            // listen enter
            if (this._isShown() && key === ks.ENTER) {
                var $item = this._getActiveItem();
                if ($item.length === 0) {
                    this._hideForce();
                    return;
                }
                else {
                    e.preventDefault();
                    this._replace(e, $item);
                    this._hideForce();
                    return;
                }
            }

            // listen down / up
            if (this._isShown() && (key === 40 || key === 38)) {
                e.preventDefault();

                var $item = this._getActiveItem();
                if ($item.length === 0) {
                    var $first = this._getFirstItem();
                    this._setActive($first);
                }
                // down
                else if (key === 40) {
                    this._setNextActive($item);
                }
                // up
                else if (key === 38) {
                    this._setPrevActive($item);
                }

                return;
            }
        },
        _getItems: function() {
            return this.$list.find('a');
        },
        _getActiveItem: function() {
            return this._getItems().filter(function(node) {
                return $R.dom(node).hasClass('active');
            });
        },
        _getFirstItem: function() {
            return this._getItems().first();
        },
        _getLastItem: function() {
            return this._getItems().last();
        },
        _setActive: function($el) {
            this._getItems().removeClass('active');
            $el.addClass('active');

            var itemHeight = $el.outerHeight();
            var itemTop = $el.position().top;
            var itemsScrollTop = this.$list.scrollTop();
            var scrollTop = itemTop + itemHeight * 2;
            var itemsHeight = this.$list.outerHeight();

            this.$list.scrollTop(
                scrollTop > itemsScrollTop + itemsHeight ? scrollTop - itemsHeight :
                    itemTop - itemHeight < itemsScrollTop ? itemTop - itemHeight :
                    itemsScrollTop
            );
        },
        _setNextActive: function($el) {
            var $next = $el.next();
            if ($next.length !== 0) {
                this._setActive($next);
            }
            else {
                var $first = this._getFirstItem();
                this._setActive($first);
            }
        },
        _setPrevActive: function($el) {
            var $prev = $el.prev();
            if ($prev.length !== 0) {
                this._setActive($prev);
            }
            else {
                var $last = this._getLastItem();
                this._setActive($last);
            }
        },
		_load: function()
		{
    		$R.ajax.get({
        		url: this.opts.handle + '&search=' + this.handleStr,
        		success: this._parse.bind(this)
    		});
		},
		_parse: function(json)
		{
    		if (json === '') return;

            var data = (typeof json === 'object') ? json : JSON.parse(json);

            this._build();
            this._buildData(data);
		},
		_build: function()
		{
            this.$list = $R.dom('#redactor-handle-list');
            if (this.$list.length === 0)
            {
                this.$list = $R.dom('<div id="redactor-handle-list">');
                this.$body.append(this.$list);
            }
        },
        _buildData: function(data)
        {
            this.data = data;

            this._update();
            this._show();
        },
        _update: function()
        {
            this.$list.html('');

            for (var key in this.data)
            {
                var $item = $R.dom('<a href="#">');
                $item.html(this.data[key].text);
                $item.attr('data-href', this.data[key].href);
                $item.attr('data-text', this.data[key].text);
                $item.on('click', this._replace.bind(this));

                this.$list.append($item);
                
            }

            // position
    		var $container = this.container.getElement();
            var containerOffset = $container.offset();
            var pos = this.selection.getPosition();

            this.$list.addClass('open');
            this.$list.css({
                top: (pos.top + pos.height + this.$doc.scrollTop()) + 'px',
                left: pos.left + 'px'
            });
        },
        _isShown: function()
        {
            return (this.$list && this.$list.hasClass('open'));
        },
        _show: function()
        {
            this.$list.addClass('open');
            this.$list.show();

            this.$doc.off('.redactor-plugin-handle');
            this.$doc.on('click.redactor-plugin-handle keydown.redactor-plugin-handle', this._hide.bind(this));
        },
        _hide: function(e)
        {
            var hidable = false;
            var key = (e && e.which);

            if (!e) hidable = true;
            else if (e.type === 'click' || key === this.keycodes.ESC) hidable = true;

            if (hidable) {
               this._hideForce();
            }
        },
        _hideForce: function() {
            this.$list.removeClass('open');
            this.$list.hide();
            this._reset();
        },
        _reset: function()
        {
            this.handleStr = '';
            this.handleLen = this.handleStart;
        },
		_replace: function(e, $el)
		{
    		e.preventDefault();

    		var $item = ($el) ? $el : $R.dom(e.target);
            var replacement = document.createElement('a');
            replacement.setAttribute('href', $item.attr('data-href'));
            replacement.innerHTML = $item.attr('data-text');

    		var marker = this.marker.insert('start');
    		var $marker = $R.dom(marker);
            var current = marker.previousSibling;
            var currentText = current.textContent;
            var re = new RegExp('@' + this.handleStr + '$');

        	currentText = currentText.replace(re, '');
        	current.textContent = currentText;

            $marker.before(replacement);

 			this.selection.restoreMarkers();

            return;
		}
    });
})(Redactor);
