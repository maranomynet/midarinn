import './js/polyfills';
import m from 'mithril';

var localStorage = window.localStorage;


var labelDefaults = {
      id: null,

      is_title: 'Titill',
      is_text: '<p>Skrifaðu hér...</p>',

      en_title: 'Title',
      en_text: '<p>Write here...</p>',

      width: 40,
      textsize: 'normal',
      vertical: false,
      duolang: true,
    };

var textsizes = [
      { value: 'large',  label: 'Stór' },
      { value: 'normal',  label: 'Venjuleg' },
      { value: 'small',  label: 'Lítil' },
    ];
var zoomlevels = [ 100, 90, 80, 70, 60, 50, 40, 33, 25, 20, 15 ];

var labels = [];
try {
  labels = localStorage && JSON.parse( localStorage.getItem('sild-midar') || null ) || labels;
}
catch (ex) {}

var activelabel = Object.assign({}, labelDefaults);
try {
  activelabel = localStorage && JSON.parse( localStorage.getItem('sild-midi') || null ) || activelabel;
}
catch (ex) {}


var state = {
      activelabel: activelabel,
      labels: labels,
      settings: {
        altstyle: false,
        zoom: 100,
      }
    };

activelabel = null;
labels = null;

var updateState = function ( fieldName, prop, newValue ) {
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

var getLabelIdx = function (id) {
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
var getLabel = function (id) {
      return state.labels[ getLabelIdx( id ) ];
    };



var action = {

  updateActiveLabel: function ( prop, newValue ) {
      var wasUpdated = updateState('activelabel', prop, newValue );
      if ( wasUpdated ) {
        state.activelabel._changed = true;
      }
      return wasUpdated;
    },

  updateSettings: function ( prop, newValue ) {
      return updateState('settings', prop, newValue );
    },


  loadLabel: function (id) {
      // var success = false;
      if ( !state.activelabel._changed || confirm('Henda óvistuðum breytingum?') ) {
        state.activelabel = (id  &&  getLabel(id))  ||  Object.assign({}, labelDefaults);
        // success = true;
      }
      // return success;
    },

  makeNewLabel: function () {
      return action.loadLabel();
    },

  deleteActiveLabel: function () {
      // var success = false;
      if ( confirm('Ertu alveg 100% viss?') ) {
        var idx = getLabelIdx( state.activelabel.id );
        if ( idx != null ) {
          state.labels = state.labels.slice();
          state.labels.splice( idx, 1 );
          action.makeNewLabel();
          // success = true;
        }
      }
      // return success;
    },

  saveActiveLabel: function () {
      var activelabel = state.activelabel;
      if ( activelabel._changed ) {
        delete activelabel._changed;
        state.labels = state.labels.slice();
        var id = activelabel.id;
        var idx = id && getLabelIdx( id );
        if ( idx != null ) {
          state.labels[idx] = activelabel;
        }
        else {
          id = '' + Date.now();
          activelabel.id = id;
          state.labels.unshift(activelabel);
        }
        if ( localStorage ) {
          localStorage.setItem('sild-midar', JSON.stringify(state.labels));
        }
      }
    },

};




var labelMaker = {};

labelMaker.renderAppSettings = function (c) {
    return  c.same.settings ||
            m('div', { className: 'appsettings' },
              m('div', { className: 'appsettings__zoom' },
                m('label', { htmlFor:'appsettings__zoom' }, 'Zoom:'),
                ' ',
                m('select', {
                    id: 'appsettings__zoom',
                    onchange: function () { action.updateSettings('zoom', this.value); },
                  },
                  zoomlevels.map(function (zoomlevel) {
                    return  m('option', {
                                value: zoomlevel,
                                selected: zoomlevel === state.settings.zoom,
                              },
                              zoomlevel + '%'
                            );
                  })
                )
              ),
              m('div', { className: 'appsettings__altstyle' },
                m('input', { type:'checkbox',
                  id: 'appsettings__altstyle',
                  checked: state.activelabel.altstyle,
                  onclick: function () { action.updateSettings('altstyle', this.checked); },
                }),
                ' ',
                m('label', { htmlFor:'appsettings__altstyle' }, 'Hinn stíllinn')
              )
            );
  };

labelMaker.renderSavedLabelsMenu = function (c) {
    return  m('div', { className: 'savedlabelsmenu' },
              !state.labels.length ? null:
              m('div', { className: 'savedlabelsmenu__labellist' },
                m('label', { htmlFor:'savedlabelsmenu__labellist' }, 'Vistaðir miðar:'),
                ' ',
                m('select', {
                    id: 'savedlabelsmenu__labellist',
                    onchange: function () { action.loadLabel(this.value); },
                  },
                  m('option', {
                      value: '',
                      selected: !state.activelabel.id
                    },
                    ''
                  ),
                  state.labels.map(function (label) {
                    return  m('option', {
                                value: label.id,
                                selected: label.id === state.activelabel.id,
                              },
                              label.is_title
                            );
                  })
                )
              ),
              m('button', { className: 'savedlabelsmenu__newlabel',
                  onclick: action.makeNewLabel,
                  disabled: !state.activelabel.id,
                },
                'Nýr miði'
              )
            );
  };

labelMaker.renderLabelSettings = function (c) {
    return  c.same.activelabel ||
            m('div', { className: 'labelsettings' },
              m('div', { className: 'labelsettings__width' },
                m('label', { htmlFor:'labelsettings__width' }, 'Breidd (cm):'),
                ' ',
                m('input', { type:'number',
                  min: 15,  max: 150,  step: 0.1,
                  id: 'labelsettings__width',
                  value: state.activelabel.width,
                  onchange: function () { action.updateActiveLabel('width', this.value); },
                })
              ),
              m('div', { className: 'labelsettings__vertical' },
                m('input', { type:'checkbox',
                  id: 'labelsettings__vertical',
                  checked: state.activelabel.vertical,
                  onclick: function () { action.updateActiveLabel('vertical', this.checked); },
                }),
                ' ',
                m('label', { htmlFor:'labelsettings__vertical' }, 'Lóðréttur miði')
              ),
              m('div', { className: 'labelsettings__textsize' },
                m('label', { htmlFor:'labelsettings__textsize' }, 'Leturstærð:'),
                ' ',
                m('select', {
                    id: 'labelsettings__textsize',
                    onchange: function () { action.updateActiveLabel('textsize', this.value); },
                  },
                  textsizes.map(function (textsize) {
                    return  m('option', {
                                value: textsize.value,
                                selected: textsize.value === state.activelabel.textsize,
                              },
                              textsize.label
                            );
                  })
                )
              ),
              m('div', { className: 'labelsettings__duolang' },
                m('input', { type:'checkbox',
                  id: 'labelsettings__duolang',
                  checked: !state.activelabel.duolang,
                  onclick: function () { action.updateActiveLabel('duolang', !this.checked); },
                }),
                ' ',
                m('label', { htmlFor:'labelsettings__duolang' }, 'Eitt tungumál')
              )
            );
  };

labelMaker.renderLabelActions = function (c) {
    return  m('div', { className: 'labelactions' },
              m('button', { className: 'labelactions__save',
                  onclick:  state.activelabel._changed ? action.saveActiveLabel : null,
                  disabled: !state.activelabel._changed,
                  title: state.activelabel.id ? 'Vista breytingar' : 'Vista þennan miða',
                },
                'Vista'
              ),
              !state.activelabel.id ? null:
              m('button', { className: 'labelactions__delete',
                  onclick: action.deleteActiveLabel,
                  title: 'Eyða þessum miða',
                },
                'Eyða'
              )
            );
  };



var insertTextAtCursor = function ( text ) {
        var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          var range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode( document.createTextNode( text ) );
        }
      };

labelMaker.renderEditableElm = function (tagName, classSuffix, propName) {
    return  m(tagName, { className: 'activelabel__section__' + classSuffix,
                contentEditable: true,
                innerHTML: state.activelabel[propName] || labelDefaults[propName],
                onkeydown: function (e) {
                    // ctrl + shift + enter
                    if ( e.which === 13  &&  e.shiftKey  &&  e.ctrlKey ) {
                      insertTextAtCursor( '\u00AD' );
                      e.preventDefault();
                    }
                    m.redraw.strategy('none');
                  },
                onblur: function () {
                    var elm = this;
                    // remove <span>s
                    // replace <div>s with a simple <br/>
                    var gunk = elm.querySelectorAll('div, span');
                    [].slice.call(gunk).forEach(function (gunkElm) {
                      if ( gunkElm.tagName === 'DIV' ) {
                        gunkElm.parentNode.insertBefore( document.createElement('br'), gunkElm );
                      }
                      [].slice.call(gunkElm.childNodes).forEach(function (node) {
                        gunkElm.parentNode.insertBefore( node, gunkElm );
                      });
                      gunkElm.parentNode.removeChild( gunkElm );
                    });
                  },
                onkeyup: function() {
                    action.updateActiveLabel(propName, this.innerHTML);
                    // Prevent redraw because live updating of multi-paragraph content
                    // moves the cursor to the beginning of the container
                    m.redraw.strategy('none');
                  },
              }
            );
  };

labelMaker.renderActiveLabel = function (c) {
    var zoomClass = state.settings.zoom !== 100 ? ' activelabel--zoom--' + state.settings.zoom : '';
    var styleClass = ' activelabel--style--' + (state.settings.altstyle? 'alternate' : 'normal');
    var textsizeClass = ' activelabel--textsize--' + state.activelabel.textsize;
    var layoutClass = ' activelabel--layout--' + (state.activelabel.vertical ? 'vertical' : 'horizontal');

    return  (c.same.activelabel && c.same.settings) ||
            m('div', { className: 'activelabel ' + zoomClass + styleClass + layoutClass + textsizeClass,
                style: 'width:'+ state.activelabel.width +'cm',
              },
              c.same.activelabel ||
              m('div', { className: 'activelabel__inner' },
                m('div', { className: 'activelabel__section' + (state.activelabel.duolang ? ' activelabel__section--is' : '') },
                  labelMaker.renderEditableElm('h2', 'title', 'is_title'),
                  labelMaker.renderEditableElm('div', 'text', 'is_text')
                ),
                !state.activelabel.duolang ? null :
                m('div', { className: 'activelabel__section activelabel__section--en' },
                  labelMaker.renderEditableElm('h2', 'title', 'en_title'),
                  labelMaker.renderEditableElm('div', 'text', 'en_text')
                )
              )
            );
  };


labelMaker.controller = function () {
    var c = {};

    var unchanged = { subtree:'retain' };
    var last = {};
    c.same = {},
    c.checkStateChange = function () {
        c.same.activelabel = state.activelabel === last.activelabel  &&  unchanged;
        c.same.labels = state.labels === last.labels  &&  unchanged;
        c.same.settings = state.settings === last.settings  &&  unchanged;

        last.activelabel = state.activelabel;
        last.labels = state.labels;
        last.settings = state.settings;
        return c.same;
      };

    return c;
  };

labelMaker.view = function (c) {
    c.checkStateChange();

    return [
        m('h1', 'Síldarmiðavélin'),
        labelMaker.renderAppSettings(c),
        labelMaker.renderSavedLabelsMenu(c),
        labelMaker.renderLabelSettings(c),
        labelMaker.renderLabelActions(c),
        labelMaker.renderActiveLabel(c)
      ];
  };


m.mount( document.body, labelMaker );

window.addEventListener('unload', function () {
  localStorage.setItem('sild-midi', JSON.stringify(state.activelabel));
});

window.state = state;

