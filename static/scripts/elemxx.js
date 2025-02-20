// A simple, portable webcomponent on the go. Refer to docs for more info https://github.com/teamdunno/elemxx#readme
/**
 * @author teamdunno <https://github.com/teamdunno>
 * @version 0.5.3
 * @license MIT
 */ /** 
 * Detach reference from existing object (only function that returns the same reference)
 * 
 * @param val The object
 * @returns New reference from the object
 * @throws TypeError on worse case (if `typeof value` dosent provide anything, or forcefully put the value as `function`)
*/ export function detachRef(val) {
    switch(typeof val){
        case "function":
          {
            return val;
          }
        case "string":
          {
            return val.valueOf();
          }
        case "number":
          {
            return val.valueOf();
          }
        case "bigint":
          {
            return val.valueOf();
          }
        case "boolean":
          {
            return val.valueOf();
          }
        case "symbol":
          {
            return val.valueOf();
          }
        case "undefined":
          {
            return undefined;
          }
        case "object":
          {
            switch(Array.isArray(val)){
              case true:
                {
                  return [
                    ...val
                  ];
                }
              default:
                {
                  if (val === null) {
                    return null;
                  }
                  return {
                    ...val
                  };
                }
            }
          }
        default:
          {
            throw new TypeError("elemxx detachRef: typeof keyword dosent provide anything to detach from");
          }
      }
    }
    /** A simple, portable webcomponent on the go */ export class Elemxx extends HTMLElement {
      /** CSS string for the elem. It would be appended to DOM if set */ static css = undefined;
      /** Attribute list. If defined, {@link Track} will be added alongside the name to the {@link Elemxx.attrs}, and not cleaned on unmounted */ static attrList = undefined;
      /** Detect if element was mounted */ mounted = false;
      /** use {@link Elemxx.attrs} insead */ static observedAttributes = this.attrList;
      /** Attributes that are defined in {@link Elemxx.attrList}. Not cleaned when unmounted unlike normal trackers on {@link Elemxx.track} */ attrs = {};
      _EXX_TRACKERS = [];
      /** Run this function on mounted */ onMount() {}
      /** Run this function on unmounted */ onUnmount() {}
      constructor(){
        super();
      }
      /** use {@link Elemxx.attrs} instead */ attributeChangedCallback(k, _, n) {
        if (typeof this.attrs[k] === "undefined") return;
        this.attrs[k].value = n;
      }
      /** 
         * ⚠️ **Note**: This is different than `this.attrs`
         * 
         * Shorthand for `Object.values(this.attrs)`
        */ eachAttrs() {
        return Object.values(this.attrs);
      }
      /** 
         * Track the changes of value
         * 
         * @param value The value
         * @param keep (default: `false`) Prevent removal of events when elem was unmounted
         * @returns [{@link Track}] object
         */ track(value, keep = false) {
        let evs = [];
        let v = value;
        const t = {
          get value () {
            return v;
          },
          set value (newValue){
            v = newValue;
            if (evs.length > 0) for(let i = 0; i < evs.length; i++)evs[i](value);
          },
          watch: function(func) {
            evs.push(func);
          },
          observe: function(func) {
            func(v);
            evs.push(func);
          },
          remove: function(func) {
            evs = evs.filter((t)=>t !== func);
          },
          removeAll: function() {
            evs = [];
          }
        };
        if (!keep) {
          this._EXX_TRACKERS.push(t);
        }
        return t;
      }
      /** use {@link Elemxx.onMount} instead */ connectedCallback() {
        // https://stackoverflow.com/a/73551405/22147523
        // weird solution, but it works
        const proto = Object.fromEntries(Object.entries(this.constructor));
        if (proto.attrList && proto.attrList.length > 0) {
          const attrList = proto.attrList;
          for(let i = 0; i < attrList.length; i++){
            const name = attrList[i];
            const obj = this.attrs[name];
            const value = this.getAttribute(name);
            if (typeof obj === "object") obj.value = value;
            else this.attrs[name] = this.track(value, true);
          }
        }
        if (proto.css) {
          proto.css = proto.css.replace(/:me/g, this.localName);
          const stychild = document.createElement("style");
          stychild.innerHTML = proto.css;
          this.appendChild(stychild);
        }
        this.onMount();
      }
      /** use {@link Elemxx.onUnmount} instead */ disconnectedCallback() {
        this.mounted = false;
        if (this._EXX_TRACKERS.length > 0) {
          for(let i = 0; i < this._EXX_TRACKERS.length; i++){
            this._EXX_TRACKERS[i].removeAll();
          }
        }
        this.onUnmount();
      }
    } // done