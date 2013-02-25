(function($) {

	var defaults = {
		sceneSelector: '.scene',
		itemsSelector: '.items',
		prevSelector: '.prev',
		nextSelector: '.next',
		disabledClass: 'disabled',
		initialIndex: 0,
		easing: 'swing',
		duration: 400,
		framerate: 50
	};

	function Slider(root, options) {
		this.root = root;

		// init configuration
		$.extend(this, defaults);
		$.extend(this, options);

		this.initScene();

		// init navigation link
		this.prev = $(this.prevSelector, this.root);
		this.prev.bind('click', $.proxy(function() {
			this.movePrev();
		}, this));

		// init navigation link
		this.next = $(this.nextSelector, this.root);
		this.next.bind('click', $.proxy(function() {
			this.moveNext();
		}, this));

		// init custom event handlers
		$.each(['onBeforeSeek', 'onSeek'], $.proxy(function(index, name) {
			if ($.isFunction(this[name])) {
				$(this).bind(name, this[name]);
			}
		}, this));

		// init navigation event handler
		$(this).bind('onSeek', function(e, idx) {
			this.prev.toggleClass(this.disabledClass, idx == 0);
			this.next.toggleClass(this.disabledClass, idx == this.getSize() - 1);
		});

		this.index = 0;
		this.seekTo(this.initialIndex, 0);
	}

	$.extend(Slider.prototype, {

		initScene: function() {
			this.scene = $(this.sceneSelector, this.root);
			this.scene.css('overflow', 'hidden');

			this.items = $('<div/>');
			this.items.css('width', '10000px');
			this.items.css('overflow', 'hidden');

			// reparent items
			var $items = this.scene.children();
			this.items.appendTo(this.scene);
			$items.appendTo(this.items);

			var totalWidths = 0;

			$.each($items, function(index, item) {
				var $item = $(item);
				$item.css('float', 'left');
				$item.css('width', $item.width());
				totalWidths += $item.outerWidth();
			});

			//  optimize pane width
			this.items.css('width', totalWidths + 'px');
		},

		getItems: function() {
			return this.items.children();
		},

		getItem: function(index) {
			return this.getItems().eq(index);
		},

		getSize: function() {
			return this.getItems().size();	
		},

		seekTo: function(idx, time) {
			if (idx < 0 || idx >= this.getSize()) {
				return; // out of bounds
			}

			if (this.busy) {
				return;
			}

			var e = $.Event("onBeforeSeek"); 
			$(this).trigger(e, [ idx ]);
			if (e.isDefaultPrevented()) {
				return;
			}

			this.busy = true;

			// sum distance
			var $item, width = 0;
			var min = Math.min(this.index, idx);
			var max = Math.max(this.index, idx);

			for (var x = min; x < max; x++) {
				$item = this.getItem(x);
				width += $item.outerWidth();
			}

			if (this.index < idx) {
				width = -width;
			}

			// get current offset
			$item = this.getItem(this.index);
			var left = parseInt(this.items.css('marginLeft'));

			if (time == null || time == undefined) {
				time = this.duration;
			}

			this.animate(left, width, {
				duration: time,
				callback: $.proxy(function() {
					$(this).trigger("onSeek", [ idx ]);
					this.index = idx;
					delete this.busy;		
				}, this)
			});
		},

		animate: function(offset, length, opts) {
			var interval = 1000 / this.framerate;
			var steps = Math.round(opts.duration / interval);
			var count = 0;

			this.animId = setInterval($.proxy(function() {
				if (count++ == steps) {
					clearInterval(this.animId);
					delete this.animId;
					opts.callback();
					return;
				}

				var progress = offset + length * count / steps;
				this.items.css('marginLeft', Math.round(progress) + 'px');
			}, this), interval);
		},

		movePrev: function(time) {
			this.seekTo(this.index - 1, time);
		},

		moveNext: function(time) {
			this.seekTo(this.index + 1, time);
		}
	});

	$.fn.slider = function(options) {
		return this.each(function() {
			new Slider($(this), options);
		});
	};

})(jQuery);

