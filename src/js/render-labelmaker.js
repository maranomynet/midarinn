import m from 'mithril';

import { state, getEmptyLabel } from './state';
import * as action from './actions';
import { textsizes, zoomlevels } from './options';



var _renderAppSettings = function (c) {
    return  c.same.settings ||
            m('div', { className: 'appsettings' },
              c.showColorChart?null:
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
              c.showColorChart?null:
              m('div', { className: 'appsettings__altstyle' },
                m('input', { type:'checkbox',
                  id: 'appsettings__altstyle',
                  checked: state.activelabel.altstyle,
                  onclick: function () { action.updateSettings('altstyle', this.checked); },
                }),
                ' ',
                m('label', { htmlFor:'appsettings__altstyle' }, 'Hinn stíllinn')
              ),
              m('div', { className: 'appsettings__colorchart' },
                m('input', { type:'checkbox',
                  id: 'appsettings__colorchart',
                  checked: c.showColorChart,
                  onclick: function () { c.showColorChart = this.checked; },
                }),
                ' ',
                m('label', { htmlFor:'appsettings__colorchart' }, 'Litaspjald')
              )
            );
  };




var _renderSavedLabelsMenu = function (c) {
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





var _renderLabelSettings = function (c) {
    return  c.same.activelabel ||
            m('div', { className: 'labelsettings' },
              m('div', { className: 'labelsettings__width', 'data-unit': 'cm' },
                m('label', { htmlFor:'labelsettings__width' }, 'Breidd: ', m('i', '(cm)') ),
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





var _renderLabelActions = function (/*c*/) {
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
var labelDefaults = getEmptyLabel();


var _renderEditableElm = function (tagName, classSuffix, propName) {
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





var _renderActiveLabel = function (c) {
    var zoomClass = state.settings.zoom !== 100 ? ' activelabel--zoom--' + state.settings.zoom : '';
    var styleClass = ' activelabel--style--' + (state.settings.altstyle? 'alternate' : 'normal');
    var textsizeClass = ' activelabel--textsize--' + state.activelabel.textsize;
    var layoutClass = ' activelabel--layout--' + (state.activelabel.vertical ? 'vertical' : 'horizontal');

    return  (c.same.activelabel && c.same.settings) ||
            m('div', { className: 'activelabel ' + zoomClass + styleClass + layoutClass + textsizeClass,
                id: 'activelabel',
                style: 'width:'+ state.activelabel.width +'cm',
              },
              c.same.activelabel ||
              m('div', { className: 'activelabel__inner' },
                m('div', { className: 'activelabel__section' + (state.activelabel.duolang ? ' activelabel__section--is' : '') },
                  _renderEditableElm('h2', 'title', 'is_title'),
                  _renderEditableElm('div', 'text', 'is_text')
                ),
                !state.activelabel.duolang ? null :
                m('div', { className: 'activelabel__section activelabel__section--en' },
                  _renderEditableElm('h2', 'title', 'en_title'),
                  _renderEditableElm('div', 'text', 'en_text')
                )
              ),
              m('div', { className: 'activelabel__height' },
                'Hæð: ',
                m('span', {
                  config: function (heightElm/*, isRedraw, ctx*/) {
                      var activeLabelElm = document.getElementById('activelabel');
                      var height = state.activelabel.width * activeLabelElm.offsetHeight / activeLabelElm.offsetWidth;
                      heightElm.innerHTML = (height+'').replace(/\.(\d)\d*$/, ',$1');
                    },
                }),
                'cm'
              )
            );
  };





var labelMaker = {
      controller: function () {
          var c = {};

          var unchanged = { subtree:'retain' };
          var last = {};
          c.same = {},
          c.checkStateChange = function () {
              c.same.activelabel = state.activelabel === last.activelabel  &&  unchanged;
              c.same.labels = state.labels === last.labels  &&  unchanged;
              c.same.settings = state.settings === last.settings  &&  unchanged;

              // last.activelabel = state.activelabel;
              last.activelabel = !c.showColorChart && state.activelabel;
              last.labels = state.labels;
              last.settings = state.settings;
              return c.same;
            };

          return c;
        },

      view: function (c) {
          c.checkStateChange();

          return [
              m('h1', 'Síldarmiðavélin'),
              _renderAppSettings(c),

              !c.showColorChart?null:
                m('div.colorchart', { key:'foo' }, [1,2,3,4,5,6,7].map(function(i){ return m('div.colorchart__bar.colorchart__bar--'+i,i); }) ),

              c.showColorChart?null:
                _renderSavedLabelsMenu(c),

              c.showColorChart?null:
                _renderLabelSettings(c), //
              c.showColorChart?null:
                _renderLabelActions(c),
              c.showColorChart?null:
                _renderActiveLabel(c)
            ];
        },
    };



export default labelMaker;
