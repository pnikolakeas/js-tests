(function($) {

	var config = {
		prevSelector: '.prev',
		nextSelector: '.next',
		disabledClass: 'disabled',
		initialIndex: 0,
		easing: 'swing',
		speed: 400
	};

	function Slider(root, options) {
		this.root = root;
		this.options = options;

		this.initScene();

		// init navigation link
		this.prev = $(options.prevSelector);
		this.prev.bind('click', $.proxy(function() {
			this.movePrev();
		}, this));

		// init navigation link
		this.next = $(options.nextSelector)
		this.next.bind('click', $.proxy(function() {
			this.moveNext();
		}, this));

		// init custom event handlers
		$.each(['onBeforeSeek', 'onSeek'], $.proxy(function(i, name) {
			if ($.isFunction(this.options[name])) { 
				$(this).bind(name, this.options[name]); 
			}
		}, this));

		// init navigation event handler
		$(this).bind('onSeek', function(e, idx) {
			this.prev.toggleClass(this.options.disabledClass, idx == 0);
			this.next.toggleClass(this.options.disabledClass, idx == this.getSize() - 1);
		});

		this.index = 0;
		this.seekTo(options.initialIndex, 0);
	}

	$.extend(Slider.prototype, {

		initScene: function() {
			this.root.css('position', 'relative');

			var offset = 0;

			$.each(this.getItems(), function(index, item) {
				var $item = $(item);
				$item.css('position', 'absolute');
				$item.css('width', $item.width());
				$item.css('left', offset);
				offset += $item.outerWidth();
			});
		},

		getItems: function() {
			return this.root.children();
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
			var left = parseInt($item.css('marginLeft'));

			// animation properties
			var props = { marginLeft: width + left + 'px' };

			this.getItems().animate(props, {
				duration: time || this.options.speed,
				easing: this.options.easing,
				complete: $.proxy(function() {
					$(this).trigger("onSeek", [ idx ]);
					this.index = idx;
					delete this.busy;		
				}, this)
			});
		},

		movePrev: function(time) {
			this.seekTo(this.index - 1, time);
		},

		moveNext: function(time) {
			this.seekTo(this.index + 1, time);
		}
	});

	$.fn.slider = function(options) {
		options = $.extend({}, config, options);

		return this.each(function() {
			new Slider($(this), options);
		});
	};

})(jQuery);

