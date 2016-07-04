/* jshint node:true, esnext:true */
'use strict';
var leverage = require('../leverageindexed.json');
var winprob = require('../winprobindexed.json');

var gameCountsByLeverageIndex = {};
var normalizedLeverageByLI = {};
var leverageNormalized = {};
var totalGameCount = 0;

// Build a map of leverage index -> game count
for ( var gameState in leverage ) {
  if ( leverage.hasOwnProperty( gameState ) ) {
    var leverageIndex = leverage[ gameState ];
    try {
      var numGames = winprob[ gameState ].total;
      if ( gameCountsByLeverageIndex[ leverageIndex ] === undefined ) {
        gameCountsByLeverageIndex[ leverageIndex ] = 0;
      }
      gameCountsByLeverageIndex[ leverageIndex ] += numGames;
      totalGameCount += numGames;
    }
    catch ( e ) { console.log( e ); }
  }
}

// For each leverage index, calculate what pct of game states are lower than it.
for ( var leverageIndex in gameCountsByLeverageIndex ) {
  if ( gameCountsByLeverageIndex.hasOwnProperty( leverageIndex ) ) {
    var gameCountWithLowerLI = 0;
    for ( var loopLeverageIndex in gameCountsByLeverageIndex ) {
      if ( gameCountsByLeverageIndex.hasOwnProperty( loopLeverageIndex ) ) {
        if ( Number( leverageIndex ) > Number( loopLeverageIndex ) ) {
          gameCountWithLowerLI += gameCountsByLeverageIndex[ loopLeverageIndex ];
        }
      }
    }
    normalizedLeverageByLI[ leverageIndex ] = 100 * gameCountWithLowerLI / totalGameCount;
  }
}

// Finally, map the normalized LI back to the game states.
for ( var gameState in leverage ) {
  if ( leverage.hasOwnProperty( gameState ) ) {
    var leverageIndex = leverage[ gameState ];
    var normalizedLI = normalizedLeverageByLI[ leverageIndex ];
    if ( normalizedLI !== undefined ) {
      leverageNormalized[ gameState ] = Number( normalizedLI.toFixed( 1 ) );
    }
  }
}

require('fs').writeFile('../leveragenormalized.json', JSON.stringify( leverageNormalized ), (err) => {
  if (err) { throw err; }
  console.log('It\'s saved!');
});