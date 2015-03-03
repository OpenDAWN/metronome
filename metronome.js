/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio metronome engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var TimeEngine = require("time-engine");

var Metronome = (function(super$0){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;if(!PRS$0)MIXIN$0(Metronome, super$0);var proto$0={};
  function Metronome() {var options = arguments[0];if(options === void 0)options = {};var audioContext = arguments[1];if(audioContext === void 0)audioContext = null;
    super$0.call(this, audioContext);

    /**
     * Metronome period in sec
     * @type {Number}
     */
    this.period = options.period || 1;

    /**
     * Metronome click frequency
     * @type {Number}
     */
    this.clickFreq = options.clickFreq || 600;

    /**
     * Metronome click attack time
     * @type {Number}
     */
    this.clickAttack = options.clickAttack || 0.002;

    /**
     * Metronome click release time
     * @type {Number}
     */
    this.clickRelease = options.clickRelease || 0.098;

    this.__phase = 0;

    this.__gainNode = super$0.audioContext.createGain();
    this.__gainNode.gain.value = options.gain || 1;

    this.outputNode = this.__gainNode;
  }if(super$0!==null)SP$0(Metronome,super$0);Metronome.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Metronome,"configurable":true,"writable":true}, gain: {"get": $gain_get$0, "set": $gain_set$0, "configurable":true,"enumerable":true}, phase: {"get": $phase_get$0, "set": $phase_set$0, "configurable":true,"enumerable":true}});DP$0(Metronome,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // TimeEngine method (scheduled interface)
  proto$0.advanceTime = function(time) {
    this.trigger(time);
    return time + this.period;
  };

  // TimeEngine method (transported interface)
  proto$0.syncPosition = function(time, position, speed) {
    var nextPosition = (Math.floor(position / this.period) + this.__phase) * this.period;

    if (speed > 0 && nextPosition < position)
      nextPosition += this.period;
    else if (speed < 0 && nextPosition > position)
      nextPosition -= this.period;

    return nextPosition;
  };

  // TimeEngine method (transported interface)
  proto$0.advancePosition = function(time, position, speed) {
    this.trigger(time);

    if (speed < 0)
      return position - this.period;

    return position + this.period;
  };

  /**
   * Trigger metronome click
   * @param {Number} time metronome click synthesis audio time
   */
  proto$0.trigger = function(time) {
    var audioContext = super$0.audioContext;
    var clickAttack = this.clickAttack;
    var clickRelease = this.clickRelease;
    var period = this.period;

    if (period < (clickAttack + clickRelease)) {
      var scale = period / (clickAttack + clickRelease);
      clickAttack *= scale;
      clickRelease *= scale;
    }

    this.__envNode = audioContext.createGain();
    this.__envNode.gain.value = 0.0;
    this.__envNode.gain.setValueAtTime(0, time);
    this.__envNode.gain.linearRampToValueAtTime(1.0, time + clickAttack);
    this.__envNode.gain.exponentialRampToValueAtTime(0.0000001, time + clickAttack + clickRelease);
    this.__envNode.gain.setValueAtTime(0, time);
    this.__envNode.connect(this.__gainNode);

    this.__osc = audioContext.createOscillator();
    this.__osc.frequency.value = this.clickFreq;
    this.__osc.start(0);
    this.__osc.stop(time + clickAttack + clickRelease);
    this.__osc.connect(this.__envNode);
  };

  /**
   * Set gain
   * @param {Number} value linear gain factor
   */
  function $gain_set$0(value) {
    this.__gainNode.gain.value = value;
  }

  /**
   * Get gain
   * @return {Number} current gain
   */
  function $gain_get$0() {
    return this.__gainNode.gain.value;
  }

  /**
   * Set phase parameter
   * @param {Number} phase metronome phase (0...1)
   */
  function $phase_set$0(phase) {
    this.__phase = phase - Math.floor(phase);
    this.resetNextPosition();
  }

  /**
   * Get phase parameter
   * @return {Number} value of phase parameter
   */
  function $phase_get$0() {
    return this.__phase;
  }
MIXIN$0(Metronome.prototype,proto$0);proto$0=void 0;return Metronome;})(TimeEngine);

module.exports = Metronome;