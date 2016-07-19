var getEmptyLabel = function () {
  return {
    id: undefined,

    is_title: 'Titill',
    is_text: '<p>Skrifaðu hér...</p>',

    en_title: 'Title',
    en_text: '<p>Write here...</p>',

    width: 40,
    textsize: 'normal',
    vertical: false,
    duolang: true,
  };
};


var getInitialState = function () {
  var labels = [];
  var activelabel = getEmptyLabel();

  var localStorage = window.localStorage;
  if ( localStorage ) {
    try {
      var savedLabels = JSON.parse( localStorage.getItem('sild-midar') || null );
      if ( savedLabels ) {
        labels =  savedLabels;
      }
    }
    catch (ex) {}
    try {
      var savedActiveLabel = JSON.parse( localStorage.getItem('sild-midi') || null )
      if ( savedActiveLabel ) {
        activelabel = savedActiveLabel;
      }
    }
    catch (ex) {}
  }

  return {
    activelabel: activelabel,
    labels: labels,
    settings: {
      altstyle: false,
      zoom: 100,
    },
  };

};

var state =  getInitialState();

export {
  state,
  getEmptyLabel,
  getInitialState as TEST__getInitialState
};
export default state;