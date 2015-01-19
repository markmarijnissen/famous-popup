var Engine          = require('famous/core/Engine');
var RenderController = require('famous/views/RenderController');
var View = require('famous/core/View');
var Transform = require('famous/core/Transform');
var StateModifier = require('famous/modifiers/StateModifier');
var Timer = require('famous/utilities/Timer');

function PopupController() {
    View.apply(this, arguments);

    var controller = new RenderController({
        inTransition: this.options.inTransition,
        outTransition: this.options.outTransition,
        overlap: this.options.overlap
    });
    this.add(controller);

    this.popups = [];
    this.controller = controller;

    // Public API: respond to both events and methods
    "push,swap,hide,unshift,clear".split(',').forEach(function(name){
        var method = this[method].bind(this);
        this._eventInput.on(name,method);
        if(this.options.global === true) Engine.on('popup-'+name,method);
    }.bind(this));

    // If the shown PopupController supports events (i.e. node.on), then respond to 'hide' event.
    this._eventOutput.on('popup',function(node){
        if(node.on) node.on('hide',this.hide.bind(this,node));
    }.bind(this));

}

PopupController.prototype = Object.create(View.prototype);
PopupController.prototype.constructor = PopupController;

PopupController.DEFAULT_OPTIONS = {
    inTransition: {curve: 'easeIn',duration: 200},
    outTransition: {curve: 'easeIn', duration: 200},
    overlap: false
};

// Add a new popup to the end of the queue.
PopupController.prototype.push = function(node){
    this.popups.push(node);
    if(this.popups.length === 1){
        this.controller.show(node);
        this._eventOutput.emit('popup',node);
    }
};

// Add a popup in front of the queue 
PopupController.prototype.unshift = function(node){
    this.popups.unshift(node);

    this.controller.show(node);
    this._eventOutput.emit('popup',node);
};

// Replace the current active popup
PopupController.prototype.swap = function(node){
    if(this.popups.length > 0){
        this.popups.splice(0,1,node);
    } else {
        this.popups.push(node);
    }

    this.controller.show(node);
    this._eventOutput.emit('popup',node);
};

// Hide a PopupController (specific popup, or the current one being shown)
PopupController.prototype.hide = function hide(node){
    if(this.popups.length === 0) return;
    
    var index = 0;
    if(node) {
        index = this.popups.indexOf(node);
        if(index < 0) {
            Engine.emit('error',{target:'PopupController',msg:'Couldn\'t find popup to hide',data:node});
            return;
        }
    }

    this.popups.splice(index,1);
    this._eventOutput.emit('hide',node);
    
    if(index === 0){
        if(this.popups.length > 0){
            node = this.popups[0];
            this.controller.show(node);
            this._eventOutput.emit('popup',node);
        } else {
            this.controller.hide();
        }
    }
};

// Remove ALL popups
PopupController.prototype.clear = function clear(){
    this.controller.hide();
    this.popups.splice(0,this.popups.length);
    this._eventOutput.emit('hide');
};

/**
 * Handle background
 */

// Default transformation for background
var HIDDEN = Transform.translate(-1000,-1000,-1000);
var VISIBLE = Transform.translate(0,0,1000);

// DEFAULTS
PopupController.DEFAULT_BACKGROUND_OPTIONS = {
    // Funtion to initialize background node with; 
    // `this` is a StateModifier
    init: function() {
        this.setOpacity(0);
        this.setTransform(HIDDEN);
    },
    // Function to show background node; 
    // `this` is a StateModifier
    show: function() {
        this.setTransform(VISIBLE);
        this.setOpacity(1,{curve:'linear',duration: 300});
    },
    // Funtion to hide background node; 
    // `this` is a StateModifier
    hide: function(){
        this.setOpacity(0,{curve:'linear',duration: 300},function(){
            this.setTransform(HIDDEN);
        }.bind(this));
    }
};

/**
 * Add a "background node" to the PopupController node
 *
 * Options contain a `init`, `show` and `hide` callbacks that is bound to the background node StateModifier.
 * See defaults above for an example.
 * 
 * @param  {RenderNode} 
 * @param  {Object}     Options with `init`,`show`,`hide` callbacks
 */
PopupController.prototype.backgroundFrom = function(node,opts){
    if(!opts) opts = {};
    ['init','show','hide'].forEach(function(name){
        if(!opts[name]) opts[name] = PopupController.DEFAULT_BACKGROUND_OPTIONS[name];
    });
    var mod = new StateModifier(),
        visible = false,
        self = this;

    this.add(mod).add(node);
    opts.init.call(mod);

    function show(){
        if(self.popups.length > 0 && !visible){
            opts.show.call(mod);
            visible = true;
        }
    }
    function hide(){
        Timer.after(function(){
            if(self.popups.length === 0 && visible){
                opts.hide.call(mod);
                visible = false;
            }
        },1);
    }
    this.on('popup',show);
    this.on('hide',hide);
};

module.exports = PopupController;
