/*jshint node:true*/
'use strict';
var winprobIndex = require('./data/winprobindexed.json');
var leverageScoreIndex = require('./data/leveragenormalized.json');

module.exports.getWinProb = function getWinProb( isTop, inning, outs, runner_on_1b, runner_on_2b, runner_on_3b, homeScore, awayScore ) {
  var state = [];

  var score;
  var bases;
  var winprob;

  if ( outs === 3 ) {
    outs = 0;
    if ( !isTop ) {
      inning++;
    }
    isTop = !isTop;
  }

  if ( isTop ) {
    score = awayScore - homeScore;
  }
  else {
    score = homeScore - awayScore;
  }
  
  if ( inning > 9 ) {
    inning = 9;
  }
  
  bases = getBaseState( runner_on_1b, runner_on_2b, runner_on_3b );

  if ( isTop ) {
    state.push('V');
  }
  else {
    state.push('H');
  }
  state.push( inning.toString() );
  state.push( outs.toString() );
  state.push( bases.toString() );
  state.push( score.toString() );
  winprob = Object.assign( {}, winprobIndex[ state.join('^') ] );

  // Give win prob from perspective of home team always.
  if ( isTop ) {
    winprob.wins = winprob.total - winprob.wins;
  }

  winprob.key = state.join('^');
  winprob.pct = winprob.wins / winprob.total;
  winprob.leverage = leverageScoreIndex[ state.join('^') ];

  return winprob;
};

function getBaseState( runner_on_1b, runner_on_2b, runner_on_3b ) {
  if ( runner_on_1b ) {
    if ( runner_on_2b ) {
      if ( runner_on_3b ) {
        return 8;  // loaded
      }
      return 4;  // 1 + 2
    }
    if ( runner_on_3b ) {
      return 6;  // corners
    }
    return 2;  // 1 only
  }
  if ( runner_on_2b ) {
    if ( runner_on_3b ) {
      return 7;  // 2 + 3
    }
    return 3;  // 2 only
  }
  if ( runner_on_3b ) {
    return 5;  // 3 only
  }
  return 1;  // empty
}
