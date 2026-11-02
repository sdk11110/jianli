import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePair, formatTenths} from '../app.js';

test('all 100 digit pairs have an exact sum in tenths and only 9,8 satisfies every condition',()=>{
 const solutions=[];
 for(let circle=0;circle<=9;circle++)for(let triangle=0;triangle<=9;triangle++){
  const result=evaluatePair(circle,triangle);
  assert.equal(result.tenths,(10*circle+triangle)+(10*triangle+circle));
  assert.equal(Number.isInteger(result.tenths),true);
  if(result.solved)solutions.push([circle,triangle]);
 }
 assert.deepEqual(solutions,[[9,8]]);
});
test('a matching sum does not override the ordering condition',()=>{
 const pair=evaluatePair(8,9);
 assert.equal(pair.tenths,187);
 assert.equal(pair.solved,false);
 assert.equal(evaluatePair(9,8).solved,true);
});
test('equal and out-of-range or noninteger digits are not solutions',()=>{
 for(const pair of [[9,9],[-1,18],[10,7],[8.5,8.5],[NaN,9],[Infinity,8]])assert.equal(evaluatePair(...pair).solved,false);
});
test('tenths formatting preserves a visible decimal place without floating point drift',()=>{
 assert.equal(formatTenths(evaluatePair(6,3).tenths),'9.9');
 assert.equal(formatTenths(187),'18.7');
 assert.equal(formatTenths(110),'11.0');
 assert.equal(formatTenths(0),'0.0');
});
