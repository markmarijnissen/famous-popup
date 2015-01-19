famous-popup
===============
> Show popup notifications with famous

### Getting started

Install using npm

```bash
  npm install famous-popup
```

Or just copy `popup.js` to your project.

## Usage:

### Creating a PopupController:

```javascript
var PopupController = require('famous-popup');

var popupCtrl = new PopupController({
	inTransition: function(){ ... } // RenderController inTransition
	outTransition: function(){ ... } // RenderController outTransition
	overlap: false // RenderController overlap
	global: false // Respond to Engine events
});

// Create a popup, which is just a RenderNode
var popup = new Surface({content: "Hello World!"});
```

### Adding Popups:

```javascript
// Add popup to the end of the queue (i.e. below all others)
popupCtrl.push(popup);

// Add popup to the front of the queue (i.e. above all others)
popupCtrl.unshift(popup);

// Replace current popup (or just show if there is no active popup)
popupCtrl.swap(popup);

// Whenever a popup is shown, popupCtrl emits an event:
popupCtrl.on('popup',function(popup) { .... });
```

### Hiding Popups:

```javascript
// Hide current popup
popupCtrl.hide();

// Hide specific popup
popupCtrl.hide(popup);

// Hide all popups
popupCtrl.clear();

// Popup can hide themselves by emitting a 'hide' event
popup.emit('hide');

// Whenever a popup is shown, popupCtrl emits an event:
popupCtrl.on('hide',function(popup) { .... });
```

### Adding a background
```javascript
var background = new Surface({
	properties: {
		'background-color':'rgba(0,0,0,0.8)'
	}
});

popupCtrl.backgroundFrom(background, {
	init: function() { .... },
	show: function() { .... },
	hide: function() { .....}
});
```

`init`,`show` and `hide` are callbacks bound to the background node StateModifier.

For example, the default background callbacks are:
```javascript
PopupController.DEFAULT_BACKGROUND_OPTIONS = {
    init: function() {
        this.setOpacity(0);
        this.setTransform(HIDDEN);
    },
    show: function() {
        this.setTransform(VISIBLE);
        this.setOpacity(1,{curve:'linear',duration: 300});
    },
    hide: function(){
        this.setOpacity(0,{curve:'linear',duration: 300},function(){
            this.setTransform(HIDDEN);
        }.bind(this));
    }
};
```

### Using events to trigger popups

```javascript
// All methods exist as events:
popupCtrl.trigger('push',popup);
popupCtrl.trigger('unshift',popup);
popupCtrl.trigger('swap',popup);
popupCtrl.trigger('hide',popup);
popupCtrl.trigger('clear');

// If you passed `engine: true` in options, 
// then you can use global events.
Engine.trigger('popup-push',popup);
Engine.trigger('popup-unshift',popup);
Engine.trigger('popup-swap',popup);
Engine.trigger('popup-hide',popup);
Engine.trigger('popup-clear');

// Note: they are prefixed with `popup-`!
```


## Changelog

### 0.1.0 (19/1/2014)

* Initial release

## Contribute

Feel free to contribute to this project in any way. The easiest way to support this project is by giving it a star.

## Contact
-   @markmarijnissen
-   http://www.madebymark.nl
-   info@madebymark.nl

© 2015 - Mark Marijnissen