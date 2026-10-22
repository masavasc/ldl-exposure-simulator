(function(root){
function model(p){
const {age,ldl,fh,treated,start,untreated,future,threshold}=p;
for(const [k,v] of Object.entries({age,ldl,future,threshold})) if(!Number.isFinite(v)||v<=0)throw Error('年齢・LDL-C・参考閾値には正の数を入力してください。');
if(age>120)throw Error('現在の年齢は120歳以下にしてください。');
const split=treated&&(fh||p.correct);
if(split&&(!Number.isFinite(start)||start<0||start>age||!Number.isFinite(untreated)||untreated<=0))throw Error('治療開始年齢は0歳から現在の年齢まで、未治療LDL-Cは正の数で入力してください。');
const past=t=>split?untreated*Math.min(t,start)+ldl*Math.max(0,t-start):ldl*t;
const current=past(age);
let crossing;
if(threshold>current)crossing=age+(threshold-current)/future;
else if(split)crossing=threshold<=untreated*start?threshold/untreated:start+(threshold-untreated*start)/ldl;
else crossing=threshold/ldl;
const baselineCross=threshold>current?age+(threshold-current)/ldl:crossing;
return {current,crossing,baselineCross,split,past,at:(t,f=future)=>t<=age?past(t):current+f*(t-age)};
}
if(typeof module!=='undefined')module.exports=model;else root.ldlModel=model;
})(globalThis);
