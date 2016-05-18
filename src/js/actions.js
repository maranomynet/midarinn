import { state, getEmptyLabel } from './state';

var _localStorage = window.localStorage;

window.addEventListener('unload', function () {
  _localStorage.setItem('sild-midi', JSON.stringify(state.activelabel));
});

var _updateState = function ( fieldName, prop, newValue ) {
      var wasUpdated = false;
      var field = state[fieldName];
      var oldValue = field[prop];
      if ( /*prop in field  &&*/  oldValue !== newValue ) {
        field = Object.assign({}, field);
        field[prop] = newValue;
        state[fieldName] = field;
        wasUpdated = true;
      }
      return wasUpdated;
    };

var _getLabelIdx = function (id) {
      var idx = -1;
      if ( id ) {
        var labels = state.labels;
        idx = labels.length;
        while ( idx-- ) {
          if ( id === labels[idx].id ) {
            break;
          }
        }
      }
      return idx >= 0 ? idx : null;
    };
var _getLabel = function (id) {
      return state.labels[ _getLabelIdx( id ) ];
    };




var updateActiveLabel = function ( prop, newValue ) {
  var wasUpdated = _updateState('activelabel', prop, newValue );
  if ( wasUpdated ) {
    state.activelabel._changed = true;
  }
  return wasUpdated;
};

var updateSettings = function ( prop, newValue ) {
  return _updateState('settings', prop, newValue );
};


var loadLabel = function (id) {
  // var success = false;
  if ( !state.activelabel._changed || confirm('Henda óvistuðum breytingum?') ) {
    state.activelabel = (id  &&  _getLabel(id))  ||  getEmptyLabel();
    // success = true;
  }
  // return success;
};

var makeNewLabel = function () {
  return loadLabel();
};

var deleteActiveLabel = function () {
  // var success = false;
  if ( confirm('Ertu alveg 100% viss?') ) {
    var idx = _getLabelIdx( state.activelabel.id );
    if ( idx != null ) {
      state.labels = state.labels.slice();
      state.labels.splice( idx, 1 );
      makeNewLabel();
      // success = true;
    }
  }
  // return success;
};

var saveActiveLabel = function () {
  var activelabel = state.activelabel;
  if ( activelabel._changed ) {
    delete activelabel._changed;
    state.labels = state.labels.slice();
    var id = activelabel.id;
    var idx = id && _getLabelIdx( id );
    if ( idx != null ) {
      state.labels[idx] = activelabel;
    }
    else {
      id = '' + Date.now();
      activelabel.id = id;
      state.labels.unshift(activelabel);
    }
    if ( _localStorage ) {
      _localStorage.setItem('sild-midar', JSON.stringify(state.labels));
    }
  }
};


export {
  updateActiveLabel,
  updateSettings,
  loadLabel,
  makeNewLabel,
  deleteActiveLabel,
  saveActiveLabel
};
