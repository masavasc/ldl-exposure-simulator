const $=id=>document.getElementById(id),fmt=n=>Math.round(n).toLocaleString('ja-JP');let active;let lastTreatment;
function sync(){const fh=$('fh').value==='yes',treated=$('treated').value==='yes';if(lastTreatment!==treated){$('futureMode').value='change';lastTreatment=treated;}$('correction').hidden=!treated||fh;$('history').hidden=!(treated&&(fh||$('correct').checked));const change=$('futureMode').value==='change';$('changeOption').textContent=treated?'治療強化':'治療開始';$('futureLabel').textContent=treated?'治療強化後のLDL-C':'治療開始後のLDL-C';$('futureField').hidden=!change;$('future').disabled=!change;$('future').required=change;$('continueInfo').hidden=change;$('continueInfo').textContent=`現在のLDL-C（${$('ldl').value||'—'} mg/dL）を今後も継続して計算します。`;}
function read(){return {age:+$('age').value,ldl:+$('ldl').value,fh:$('fh').value==='yes',treated:$('treated').value==='yes',correct:$('correct').checked,start:+$('start').value,untreated:+$('untreated').value,future:$('futureMode').value==='change'?+$('future').value:+$('ldl').value,threshold:+$('threshold').value};}
function render(){sync();try{const p=read(),m=ldlModel(p);active={p,m};$('error').textContent='';$('total').textContent=fmt(m.current);const reached=m.current>=p.threshold;$('cross').textContent=m.crossing>120?'120歳超':m.crossing.toFixed(1)+'歳';$('crossSub').textContent=reached?'設定上、現在までに到達済み':'今後の設定値を維持した場合';$('method').textContent=p.fh?'FH：多田らの方法に基づく簡易推定':m.split?'非FH：治療歴補正を加えた拡張モデル':'非FH：年齢 × 現在LDL-C（eCLE）';$('limitations').textContent=($('fh').value==='unknown'?'FH状態は不明です。非FHの式で暫定計算しています。 ':'')+(!p.fh&&p.treated&&!m.split?'治療中の現在値を過去に当てはめるため、治療前の曝露を過小評価し得ます。 ':'')+(!p.fh?'非FHの根拠はACS患者の研究であり、一般住民への精度は未検証です。 ':'未治療値と治療後の値が、それぞれの期間で一定だったと仮定しています。 ');const ageText=n=>n.toFixed(1)+'歳';
const continuing=p.treated?'現行治療継続':'現状継続（未治療）';
const changing=p.treated?'治療強化':'治療開始';
let result=`<h3>参考閾値への到達年齢</h3><div class="result-row"><span>${continuing}</span><strong>${ageText(m.baselineCross)}</strong></div>`;
if($('futureMode').value==='change')result+=`<div class="result-row treatment"><span>${changing}</span><strong>${ageText(m.crossing)}</strong></div>`;
if(reached)result+='<p class="small">推定上、すでに参考閾値に到達しています。両条件で過去の到達年齢は同じです。</p>';
$('comparison').innerHTML=result;

const end=p.age<90?100:120,W=760,H=540,l=118,r=30,t=66,b=92;
const max=Math.max(p.threshold*1.15,m.at(end),m.at(end,p.ldl),m.split?p.untreated*end:0,180*end)*1.12;
const bottom=H-b,x=a=>l+a/end*(W-l-r),y=c=>bottom-c/max*(bottom-t);
let out='<defs><marker id="arrow-down" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="#a16a16"/></marker></defs>';
const text=(xx,yy,s,more='')=>`<text x="${xx}" y="${yy}" fill="#344f54" font-size="15" font-weight="600" ${more}>${s}</text>`;
for(let i=0;i<=4;i++){const v=max*i/4;out+=`<line x1="${l}" x2="${W-r}" y1="${y(v)}" y2="${y(v)}" stroke="#e2eae8"/>`+text(l-10,y(v)+5,fmt(v),'text-anchor="end"');}
for(let a=0;a<=end;a+=20)out+=`<line x1="${x(a)}" x2="${x(a)}" y1="${bottom}" y2="${bottom+7}" stroke="#344f54" stroke-width="2"/>`+text(x(a),bottom+28,a,'text-anchor="middle"');
out+=`<text transform="translate(28 ${(t+bottom)/2}) rotate(-90)" text-anchor="middle" fill="#173d43" font-size="21" font-weight="750">推定累積LDL-C（mg/dL・年）</text>`+text(W-r,H-12,'年齢（歳）','text-anchor="end"');
const path=(a,z,f,color,dash,width=4.5)=>{let d='';for(let v=a;v<z;v+=.5)d+=(d?'L':'M')+x(v)+','+y(f(v));d+=(d?'L':'M')+x(z)+','+y(f(z));return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" ${dash?'stroke-dasharray="12 8"':''}/>`;};
// Background comparators are hypothetical lifetime exposures, not risk categories.
out+=`<path d="M${x(0)},${bottom} L${x(end)},${y(end*180)} L${x(end)},${y(end*100)} Z" fill="#edf1f5" opacity="0.7"/>`;
out+=path(0,end,a=>a*180,'#c0adbd',false,2)+path(0,end,a=>a*100,'#abc8bf',false,2);
const refLabel=(v,label,color)=>`<text x="${x(end)-8}" y="${y(end*v)-10}" text-anchor="end" fill="${color}" font-size="14" font-weight="650" stroke="white" stroke-width="4" paint-order="stroke">${label}</text>`;
out+=refLabel(180,'生涯 LDL-C 180','#876d82')+refLabel(100,'生涯 LDL-C 100','#547d70');
out+=`<line x1="${l}" x2="${W-r}" y1="${y(p.threshold)}" y2="${y(p.threshold)}" stroke="#a16a16" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-dasharray="9 6"/>`+`<text x="${l+10}" y="${y(p.threshold)-12}" fill="#89570d" font-size="19" font-weight="750" stroke="white" stroke-width="4" paint-order="stroke">参考閾値 ${fmt(p.threshold)}</text>`;
out+=`<path d="M${l},${t-12} V${bottom} H${W-r+6}" fill="none" stroke="#173d43" stroke-width="2.8" vector-effect="non-scaling-stroke"/>`;
out+=path(0,p.age,m.past,'#087e83',false)+path(p.age,end,v=>m.at(v,p.ldl),'#64748b',true)+path(p.age,end,m.at,'#2563c4',true);
// Untreated counterfactual continues the pretreatment LDL-C without crossing markers.
if(m.split){out+=path(p.start,end,a=>p.untreated*a,'#be607c',true,3);}
// Treatment start is a change in slope of cumulative exposure.
if(m.split){const tx=x(p.start),ty=y(p.untreated*p.start);const lx=Math.min(W-r-92,Math.max(l+8,tx+12));const ly=Math.min(bottom-12,ty+32);out+=`<rect x="${tx-5}" y="${ty-5}" width="10" height="10" rx="2" fill="#173d43" stroke="white" stroke-width="2"/><line x1="${tx+5}" y1="${ty+5}" x2="${lx}" y2="${ly-5}" stroke="#173d43" stroke-width="1.5"/><text x="${lx}" y="${ly}" fill="#173d43" font-size="15" font-weight="750" stroke="white" stroke-width="4" paint-order="stroke">治療開始 ${p.start}歳</text>`;}
$('untreatedLegend').hidden=!m.split;
// Two-line age labels sit beside their arrows within the graph.
const change=$('futureMode').value==='change';
const projections=[{age:m.baselineCross,label:'このまま継続',color:'#64748b',side:-1}];
if(change)projections.push({age:m.crossing,label:p.treated?'治療強化後':'治療開始後',color:'#db5228',side:1});
let previousBox;
for(const point of projections){const visible=point.age<=end,cx=x(Math.min(end,point.age)),cy=y(p.threshold),bw=118,bh=visible?60:77;
const bx=Math.max(l+7,Math.min(W-r-bw-5,point.side<0?cx-bw-12:cx+12));
let by=Math.max(t+8,Math.min(bottom-bh-16,cy+(bottom-cy)*0.55));
if(previousBox&&bx<previousBox.x+bw+8&&bx+bw>previousBox.x-8&&Math.abs(by-previousBox.y)<bh+8)by=Math.max(t+8,previousBox.y-bh-12);
previousBox={x:bx,y:by};
if(visible)out+=`<line x1="${cx}" x2="${cx}" y1="${cy+9}" y2="${bottom+9}" stroke="${point.color}" stroke-width="2" stroke-dasharray="5 4"/><path d="M${cx-5},${bottom+2} L${cx},${bottom+10} L${cx+5},${bottom+2}" fill="${point.color}"/><circle cx="${cx}" cy="${cy}" r="6" fill="${point.color}"/>`;
out+=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="9" fill="${point.color}"/><text x="${bx+bw/2}" y="${by+23}" text-anchor="middle" fill="white" font-size="15" font-weight="700">${point.label}</text><text x="${bx+bw/2}" y="${by+49}" text-anchor="middle" fill="white" font-size="23" font-weight="800">${point.age.toFixed(1)}歳</text>`;
if(!visible)out+=`<text x="${bx+bw/2}" y="${by+67}" text-anchor="middle" fill="white" font-size="11">到達点は表示範囲外</text>`;
}
// Current-position speech bubble; move away from threshold where possible.
const px=x(p.age),py=y(m.current),bubbleW=154,bubbleH=57;
const bx=Math.max(l+8,Math.min(W-r-bubbleW,px-bubbleW/2));
const by=py-90>=t?py-90:Math.min(bottom-bubbleH-12,py+28);
const pointerY=by<py?by+bubbleH:by,pointerX=Math.max(bx+18,Math.min(bx+bubbleW-18,px));
out+=`<circle cx="${px}" cy="${py}" r="17" fill="#d7efea" stroke="#087e83" stroke-width="2"/><circle cx="${px}" cy="${py}" r="9" fill="#087e83" stroke="white" stroke-width="2.5"/><path d="M${pointerX-8},${pointerY} L${px},${py+(by<py?-15:15)} L${pointerX+8},${pointerY}" fill="#087e83"/><rect x="${bx}" y="${by}" width="${bubbleW}" height="${bubbleH}" rx="12" fill="#087e83"/><text x="${bx+bubbleW/2}" y="${by+24}" fill="white" font-size="19" font-weight="800" text-anchor="middle">今はココ</text><text x="${bx+bubbleW/2}" y="${by+45}" fill="white" font-size="14" font-weight="600" text-anchor="middle">${p.age}歳 · ${fmt(m.current)}</text>`;
$('chart').innerHTML=out;

}catch(e){active=null;$('error').textContent=e.message;$('total').textContent='—';$('cross').textContent='—';$('chart').innerHTML='';$('comparison').textContent='入力条件を確認してください。';}}
$('form').addEventListener('submit',e=>{e.preventDefault();render();});['fh','treated','correct','futureMode'].forEach(id=>$(id).addEventListener('change',()=>{sync();render();}));$('ldl').addEventListener('input',()=>{if($('futureMode').value==='continue')render();});$('preset').addEventListener('change',()=>{if($('preset').value!=='custom')$('threshold').value=$('preset').value;render();});$('threshold').addEventListener('input',()=>{$('preset').value='custom';});$('reset').onclick=()=>{$('form').reset();lastTreatment=undefined;render();};$('csv').onclick=()=>{render();if(!active)return;const {p,m}=active;let s='\ufeff年齢,現在値維持の累積LDL-C,設定値での累積LDL-C,参考閾値,区分\n';for(let a=0;a<=120;a++)s+=`${a},${m.at(a,p.ldl).toFixed(2)},${m.at(a).toFixed(2)},${p.threshold},${a<=p.age?'過去の推定':'将来の仮定'}\n`;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([s],{type:'text/csv;charset=utf-8'}));a.href=url;a.download='ldl-exposure.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};render();
