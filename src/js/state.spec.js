/* global describe, it, expect */
import { state, getEmptyLabel, TEST__getInitialState as getInitialState } from './state';

describe('getEmptyLabel', function () {

  var label1 = getEmptyLabel();
  var label2 = getEmptyLabel();

  it('returns equal objects', function () {
    expect( label1 ).toEqual( label2 );
  });

  it('returns unique instances', function () {
    expect( label1 ).not.toBe( label2 );
  });

  it('returns objects with IDs present but undefined', function () {
    expect( 'id' in label1 ).toBe( true );
    expect( label1.id ).toBeUndefined();
  });

});


describe('state object', function () {

  // afterAll(function () {
  //   localStorage.removeItem('sild-midi');
  //   localStorage.removeItem('sild-midar');
  // });

  it('comes initialized', function () {
    expect( state ).toBeDefined();
    expect( state.activelabel ).toEqual( getEmptyLabel() );
    expect( state.labels ).toEqual( [] );
  });

  var localStorage = window.localStorage;
  if ( localStorage ) {
    it('shouldn\'t have localStorage copy saved', function () {
      expect( localStorage.getItem('sild-midi') ).toBeNull();
    });
  }


});