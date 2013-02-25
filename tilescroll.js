(function($) {

	Scroller = Obj.extend(Obj, {

		tileWidth  : 100, // pixels
		tileHeight : 75,  // pixels
		currOffset : 0,   // pixels
		framerate  : 30,  // frames per second
		lagFactor  : 3,

		init: function() {
			// init custom event handlers
			$.each(['onBeforeSeek', 'onSeek'], $.proxy(function(index, name) {
				if ($.isFunction(this[name])) {
					$(this).bind(name, this[name]);
				}
			}, this));

			this.initScene();
			this.seekTo(0);
		},

		initScene: function() {
			// milliseconds per frame
			this.interval = 1000 / this.framerate;

			this.root.css('position', 'relative');

			this.tileCount = Math.floor((this.root.width() - 1) / this.tileWidth) + 2;
			this.sceneWidth = (this.tileCount - 1) * this.tileWidth;
			this.stageWidth = this.tileCount * this.tileWidth;
			this.slideWidth = this.contents.length * this.tileWidth - this.sceneWidth - 1;

			console.log('### initScene() tileCount: ' + this.tileCount);
			console.log('### initScene() sceneWidth: ' + this.sceneWidth);
			console.log('### initScene() stageWidth: ' + this.stageWidth);
			console.log('### initScene() slideWidth: ' + this.slideWidth);

			for (var i = 0; i < this.tileCount; ++i) {
				var $tile = $('<div/></div>');
				$tile.addClass('tile');
				$tile.css('overflow', 'hidden');
				$tile.css('position', 'absolute');
				$tile.css('width', this.tileWidth);
				$tile.css('height', this.tileHeight);
				$tile.appendTo(this.root);
			}
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

		seekTo: function(idx) {
			if (idx < 0 || idx > 1) {
				// out of bounds
				return;
			}

			this.viewOffset = Math.floor(this.slideWidth * idx);
			// console.log('### viewOffset: ' + this.viewOffset);

			if (this.running) {
				return;
			}

			var e = $.Event("onBeforeSeek"); 
			$(this).trigger(e, [ idx ]);
			if (e.isDefaultPrevented()) {
				return;
			}

			this.animate({
				// called at the end
				callback: $.proxy(function() {
					$(this).trigger("onSeek", [ idx ]);
				}, this)
			});
		},

		animate: function(opts) {
			this.running = 1;
			// console.log('### starting');
			this.animint = setInterval($.proxy(function() {
				var exit = this.running >= 100; // fail ???

				if (this.running > 1 && this.currOffset == this.viewOffset || exit) {
					// console.log('### stopping ' + this.animint + ' ' + this.running + ' ' + exit);
					clearInterval(this.animint);
					delete this.animint;
					delete this.running;
					opts.callback();
					return;
				}

				++this.running;

				// this.currOffset = this.viewOffset; // run for one frame (debug)
				this.currOffset = this.currOffset + (this.viewOffset - this.currOffset) / this.lagFactor;
				this.currOffset = this.currOffset < this.viewOffset ? Math.ceil(this.currOffset) : Math.floor(this.currOffset);
				// console.log('###  viewOffset: ' + this.viewOffset + ' currOffset: ' + this.currOffset);

				for (var i = 0; i < this.tileCount; ++i) {
					var $tile = this.getItem(i);

					var tileOffset = i * this.tileWidth - this.currOffset;
					tileOffset = (tileOffset - this.sceneWidth) % this.stageWidth + this.sceneWidth;

					var newContentIndex = (tileOffset + this.currOffset) / this.tileWidth;
					var oldContentIndex = $tile.data('contentIndex');

					if (newContentIndex != oldContentIndex) {
						$tile.data('contentIndex', newContentIndex);
						$tile.html('<img src="' + this.contents[newContentIndex] + '" />');
						// console.log('### tile: ' + i + ' index: ' + newContentIndex);
					}

					$tile.css('left', tileOffset + 'px');
				}
			}, this), this.interval);
		}
	});

	$.fn.scroller = function(options) {
		var config = $.extend({}, options);
		$.extend(config, { root: this });
		return new Scroller(config);
	};

})(jQuery);
