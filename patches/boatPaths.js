import { definePatch, insert } from "../modUtils.js";

// Draw the route a boat (ship) has travelled, from its launch point to its
// current position. Own boats are tinted blue, enemy boats heading for the
// viewing player's territory are red, and other boats are white.
//
// Also draw a battle marker between ships that are actively fighting and show
// a red notification naming the attacker when one of our ships is destroyed in
// battle.
export default definePatch(({ modifyCode, matchCode, replace, replaceCode, replaceOne, escapeRegExp }) => {
  // Capture the minified names of the tile-owner lookup used when a ship lands.
  const { lj, mq } = matchCode(`var player=bQ.lj.mq(mF[mF.length-1]);`);

  // Capture the team flag and team map used by the game's combat check.
  const team = matchCode(`var aby=aE.iT;var aXP=bj.fX;`, {
    dictionary: { iT: "iT", fX: "fX" },
  });

  // Capture the notification renderer, the player-name list, and the red
  // flash colour used by the game's own messages.
  const notification = matchCode(`aO.a0i(80,L(552),637,0,bE.qD,bE.pL,-1,false);`);
  const playerNames = matchCode(`ah.a0j[player]+" supported "+ah.a0j[qs]+" with "`);
  const flash = matchCode(`aaE[aC]?bE.pw:bE.pO`);

  // Capture the ship id, attacker id, and tick count used when combat damages
  // a ship.
  const combat = matchCode(`var fZ=tt.mk;var mz=tt.mz;var mo=tt.mo;var a8n=tt.a8n;var aaE=tt.aaE;var jM=bQ.jM.jM;`);
  const attacker = matchCode(`i1=mo[iR]>>3;nv=abU%aah;nw=~~((abU+0.5)/aah);`);
  const clock = matchCode(`if(bi.kr()%2!==1){return}`);
  const death = matchCode(`var a8n=tt.a8n;var aaE=tt.aaE;for(var aC=tt.mk-1;aC>=0;aC--){aaE[aC]=aaE[aC]>>1;if(a8n[aC]===0){bQ.mt.aZo(aC);bQ.aK5.aa7(aC)}}`);

  const drawingCode = `
if (__fx.settings.showBoatPaths) {
  ib.setTransform(1, 0, 0, 1, 0, 0);
  ib.lineCap = "round";
  ib.lineJoin = "round";
  var __fxBpWidth = Math.max(1.5, fD * 2.2);
  for (var __fxBpIdx = 0; __fxBpIdx < fZ; __fxBpIdx++) {
    var __fxBpPath = bQ.z.mm[__fxBpIdx];
    if (!__fxBpPath || __fxBpPath.length === 0) continue;
    var __fxBpOwn = (mo[__fxBpIdx] >> 3) === aae;
    var __fxBpIncoming = !__fxBpOwn
      && bQ.__FXLJ__.__FXMQ__(__fxBpPath[__fxBpPath.length - 1]) === aae;
    ib.strokeStyle = __fxBpOwn
      ? "rgba(90, 170, 255, 0.95)"
      : (__fxBpIncoming ? "rgba(255, 60, 60, 0.95)" : "rgba(255, 255, 255, 0.5)");
    ib.lineWidth = __fxBpWidth;
    ib.beginPath();
    var __fxBpStarted = false;
    var __fxBpMy = bQ.z.my[__fxBpIdx];
    for (var __fxBpPt = 0; __fxBpPt <= __fxBpMy && __fxBpPt < __fxBpPath.length; __fxBpPt++) {
      var __fxBpPos = bP.jJ(__fxBpPath[__fxBpPt]);
      var __fxBpSX = aaf * (((__fxBpPos % aah) / 16) - nv) / iw;
      var __fxBpSY = aag * ((Math.floor(__fxBpPos / aah) / 16) - nw) / iz;
      if (__fxBpStarted) ib.lineTo(__fxBpSX, __fxBpSY);
      else { ib.moveTo(__fxBpSX, __fxBpSY); __fxBpStarted = true; }
    }
    var __fxBpCur = mz[__fxBpIdx];
    var __fxBpCSX = aaf * (((__fxBpCur % aah) / 16) - nv) / iw;
    var __fxBpCSY = aag * ((Math.floor(__fxBpCur / aah) / 16) - nw) / iz;
    if (__fxBpStarted) ib.lineTo(__fxBpCSX, __fxBpCSY);
    else ib.moveTo(__fxBpCSX, __fxBpCSY);
    ib.stroke();
  }
  ib.setTransform(1, 0, 0, 1, 0, 0);
}
`;

  const battleCode = `
if (__fx.settings.showShipBattleIndication) {
  ib.setTransform(1, 0, 0, 1, 0, 0);
  ib.lineCap = "round";
  ib.lineJoin = "round";
  var __fxBattleRange = 120 * 120;
  for (var __fxBi = 0; __fxBi < fZ; __fxBi++) {
    if (!aaE[__fxBi]) continue;
    var __fxBiPos = mz[__fxBi];
    var __fxBiX = __fxBiPos % aah;
    var __fxBiY = Math.floor(__fxBiPos / aah);
    var __fxBiPlayer = mo[__fxBi] >> 3;
    var __fxBj = -1;
    var __fxBd = __fxBattleRange;
    for (var __fxBk = 0; __fxBk < fZ; __fxBk++) {
      if (__fxBk === __fxBi) continue;
      var __fxBkPlayer = mo[__fxBk] >> 3;
      if (__fxBkPlayer === __fxBiPlayer) continue;
      if (aE.iT && __FXBJ__.fX[__fxBkPlayer] === __FXBJ__.fX[__fxBiPlayer] && __FXBJ__.fX[__fxBkPlayer]) continue;
      var __fxBkPos = mz[__fxBk];
      var __fxBdx = __fxBiX - (__fxBkPos % aah);
      var __fxBdy = __fxBiY - Math.floor(__fxBkPos / aah);
      var __fxBdist = __fxBdx * __fxBdx + __fxBdy * __fxBdy;
      if (__fxBdist < __fxBd) {
        __fxBd = __fxBdist;
        __fxBj = __fxBk;
      }
    }
    if (__fxBj < 0) continue;
    if (__fxBi > __fxBj && aaE[__fxBj]) continue;
    var __fxBjPos = mz[__fxBj];
    var __fxBx1 = aaf * (((__fxBiPos % aah) / 16) - nv) / iw;
    var __fxBy1 = aag * ((Math.floor(__fxBiPos / aah) / 16) - nw) / iz;
    var __fxBx2 = aaf * (((__fxBjPos % aah) / 16) - nv) / iw;
    var __fxBy2 = aag * ((Math.floor(__fxBjPos / aah) / 16) - nw) / iz;
    var __fxBmidX = (__fxBx1 + __fxBx2) / 2;
    var __fxBmidY = (__fxBy1 + __fxBy2) / 2;
    ib.setLineDash([6 * Math.max(1, fD), 4 * Math.max(1, fD)]);
    ib.strokeStyle = "rgba(255, 110, 70, 0.9)";
    ib.lineWidth = Math.max(1.5, fD * 1.8);
    ib.beginPath();
    ib.moveTo(__fxBx1, __fxBy1);
    ib.lineTo(__fxBx2, __fxBy2);
    ib.stroke();
    ib.setLineDash([]);
    var __fxBr = Math.max(4, fD * 3);
    ib.beginPath();
    ib.arc(__fxBmidX, __fxBmidY, __fxBr * 2.2, 0, 6.283185307179586);
    ib.fillStyle = "rgba(255, 70, 50, 0.18)";
    ib.fill();
    ib.beginPath();
    ib.arc(__fxBmidX, __fxBmidY, __fxBr, 0, 6.283185307179586);
    ib.fillStyle = "rgba(255, 70, 50, 0.95)";
    ib.fill();
    ib.lineWidth = Math.max(1, fD * 0.8);
    ib.strokeStyle = "rgba(255, 235, 220, 0.95)";
    ib.stroke();
    var __fxBs = __fxBr * 0.55;
    ib.beginPath();
    ib.moveTo(__fxBmidX - __fxBs, __fxBmidY - __fxBs);
    ib.lineTo(__fxBmidX + __fxBs, __fxBmidY + __fxBs);
    ib.moveTo(__fxBmidX + __fxBs, __fxBmidY - __fxBs);
    ib.lineTo(__fxBmidX - __fxBs, __fxBmidY + __fxBs);
    ib.stroke();
  }
  ib.setLineDash([]);
  ib.setTransform(1, 0, 0, 1, 0, 0);
}
`;

  const names = modifyCode(`
var mz=bQ.z.mz;
var mo=bQ.z.mo;
var a8n=bQ.z.a8n;
var aaE=bQ.z.aaE;
var aad=aaJ;
var aae=aE.fJ;
var fZ=bQ.z.mk;
var aaf=i.j;
var aag=i.k;
var aah=bV.fk<<4;
var aai=aaK;
var fO=im;
var fD=fO/aai;
var nv=jD/fO;
var nw=jE/fO;
var o8=(aaf+jD)/fO;
var o9=(aag+jE)/fO;
var iw=o8-nv;
var iz=o9-nw;
var ib=ws;
${insert(drawingCode)}`);

  // Substitute the captured minified names after the code has been inserted.
  replace("__FXLJ__", lj);
  replace("__FXMQ__", mq);

  const applyNames = (code, mapping) =>
    Object.keys(mapping)
      .sort((a, b) => b.length - a.length)
      .reduce(
        (result, key) =>
          result.replace(new RegExp(`\\b${key}\\b`, "g"), () => mapping[key]),
        code
      );

  // Draw the battle marker after all ships so it appears on top of them.
  const battle = applyNames(battleCode, {
    ...names,
    __FXBJ__: team.bj,
  });
  const endAnchor = `${names.ib}.imageSmoothingEnabled=false;${names.ib}.setTransform(1,0,0,1,0,0)};`;
  replaceOne(
    new RegExp(escapeRegExp(endAnchor), "g"),
    (battle + endAnchor).replaceAll("$", "$$")
  );

  // Remember which player last damaged each ship so we can name the attacker
  // at the moment the ship is destroyed.
  const combatNames = {
    tt: combat.tt,
    i1: attacker.i1,
    bi: clock.bi,
  };
  replaceCode(
    `a8n[abr]=Math.max(abv-abt,0);aaE[abr]=4`,
    `a8n[abr]=Math.max(abv-abt,0);aaE[abr]=4;`
      + `if(abv>0)(__fx.shipAttackers||(__fx.shipAttackers={}))[tt.mn[abr]]={p:i1,t:bi.kr()};`,
    { dictionary: combatNames }
  );

  // Clear the attack records when a new game starts.
  replaceCode(
    `this.mk=0;this.n3=0;this.ky.fill(0);this.mm.fill(null)`,
    `this.mk=0;this.n3=0;this.ky.fill(0);this.mm.fill(null);__fx.shipAttackers={};`
  );

  // When one of the local player's ships is destroyed in battle this tick,
  // show a red message naming the player who delivered the final hit.
  const deathNames = {
    tt: death.tt,
    aE: team.aE,
    bi: clock.bi,
    aO: notification.aO,
    a0i: notification.a0i,
    bE: notification.bE,
    pL: notification.pL,
    pw: flash.pw,
    ah: playerNames.ah,
    a0j: playerNames.a0j,
  };
  replaceCode(
    `if(a8n[aC]===0){bQ.mt.aZo(aC);bQ.aK5.aa7(aC)}`,
    `if(a8n[aC]===0){`
      + `var __fxAtk=__fx.shipAttackers&&__fx.shipAttackers[tt.mn[aC]];`
      + `if(__fx.settings.showShipBattleIndication&&(tt.mo[aC]>>3)===aE.fJ&&__fxAtk&&__fxAtk.t===bi.kr()){`
      + `aO.a0i(180,"Ship intercepted by "+(ah.a0j[__fxAtk.p]||"Unknown"),637,0,bE.pw,bE.pL,-1,false);`
      + `}`
      + `if(__fx.shipAttackers){delete __fx.shipAttackers[tt.mn[aC]];}`
      + `bQ.mt.aZo(aC);bQ.aK5.aa7(aC)`
      + `}`
  );
});
