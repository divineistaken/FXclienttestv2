import { definePatch, insert } from "../modUtils.js";

// Draw the route a boat (ship) has travelled, from its launch point to its
// current position. Own boats are tinted blue, other players' boats white.
export default definePatch(({ modifyCode }) => {
  const drawingCode = `
if (__fx.settings.showBoatPaths) {
  ib.setTransform(1, 0, 0, 1, 0, 0);
  ib.lineCap = "round";
  ib.lineJoin = "round";
  var __fxBpWidth = Math.max(1, fD * 2);
  for (var __fxBpIdx = 0; __fxBpIdx < fZ; __fxBpIdx++) {
    var __fxBpPath = bQ.z.mm[__fxBpIdx];
    if (!__fxBpPath) continue;
    var __fxBpOwn = (mo[__fxBpIdx] >> 3) === aae;
    ib.strokeStyle = __fxBpOwn ? "rgba(90, 170, 255, 0.85)" : "rgba(255, 255, 255, 0.28)";
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

  modifyCode(`
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
});
