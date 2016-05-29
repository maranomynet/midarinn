import { state, getEmptyLabel } from './state';
import 'array_sortISL';

var _localStorage = window.localStorage;

window.addEventListener('unload', function () {
  _localStorage['sild-midi'] = JSON.stringify(state.activelabel);
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
          if ( labels[idx].id === id ) {
            break;
          }
        }
      }
      return idx < 0 ? null : idx;
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
  return loadLabel(null);
};

var deleteActiveLabel = function () {
  // var success = false;
  if ( confirm('Ertu alveg 100% viss?') ) {
    var idx = _getLabelIdx( state.activelabel.id );
    if ( idx != null ) {
      state.labels = state.labels.slice();
      state.labels.splice( idx, 1 );
      _localStorage['sild-midar'] = JSON.stringify(state.labels);
      makeNewLabel();
      // success = true;
    }
  }
  // return success;
};



var _saveLabel = function (label) {
  state.labels = state.labels.slice();
  var id = label.id;
  var idx = id && _getLabelIdx( id );
  window.console.log( '_saveLabel', idx );
  if ( idx != null ) {
    state.labels[idx] = label;
  }
  else {
    label.id = label.id || ('' + Date.now());
    state.labels.unshift(label);
    state.labels.sortISL({
        getProp: function (label) {
            return label.is_title.toLowerCase();
          },
      });
  }
  if ( _localStorage ) {
    _localStorage['sild-midar'] = JSON.stringify(state.labels);
  }
};

var saveActiveLabel = function () {
  var activelabel = state.activelabel;
  if ( activelabel._changed ) {
    delete activelabel._changed;
    _saveLabel( activelabel );
  }
};



var _addImportedLabels = function ( labels ) {
  var activelabel = state.activelabel;
  labels.forEach(function (label) {
      _saveLabel( label );
      if ( label.id === activelabel.id  &&  !activelabel._changed ) {
        state.activelabel = label;
      }
    });
};


var readLabelsFromFile = function (file, callback) {
  var reader = new FileReader();
  reader.onload = function (e) {
      var labels;
      var error;
      var success;
      try {
        var labels = JSON.parse(e.target.result)
        _addImportedLabels( labels );
        success = 'Búin að lesa inn gögn';
      }
      catch (ex) {
        error = 'Tókst ekki að lesainn gögnin';
      }
      callback && callback( success, error );
    };
  reader.readAsText( file );
};



export {
  updateActiveLabel,
  updateSettings,
  loadLabel,
  makeNewLabel,
  deleteActiveLabel,
  readLabelsFromFile,
  saveActiveLabel
};
