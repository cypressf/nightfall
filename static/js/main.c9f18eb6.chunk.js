(this.webpackJsonpnightfall=this.webpackJsonpnightfall||[]).push([[0],{12:function(t,e,n){t.exports={wrapper:"Game_wrapper__3oH14"}},19:function(t,e,n){},20:function(t,e,n){},27:function(t,e,n){"use strict";n.r(e);var a=n(0),i=n.n(a),o=n(6),r=n.n(o),c=(n(19),n(20),n(14)),s=n(5),u=n(2),l=function(){return Object(u.b)()},d=(u.c,n(12)),f=n.n(d),h=n(3),p={phase:"select",gridSize:{width:10,height:10},units:[{positions:[{x:0,y:0}],length:1,stats:{name:"Red",maxLength:3,range:1,movement:1,attack:1,color:"red",headColor:"brown",id:"a"}},{positions:[{x:4,y:4}],length:1,stats:{name:"Yellow",maxLength:3,range:1,movement:1,attack:1,color:"yellow",headColor:"green",id:"b"}}].reduce((function(t,e){return t[e.stats.id]=e,t}),{})},v=function(t,e){var n,a=Object(s.a)(t);try{for(a.s();!(n=a.n()).done;){var i=n.value;if(i.x===e.x&&i.y===e.y)return!0}}catch(o){a.e(o)}finally{a.f()}return!1},b=function(t,e,n){var a=e.positions,i=a[a.length-1];return Math.abs(n.x-i.x)+Math.abs(n.y-i.y)<=1&&!function(t,e){var n,a=Object(s.a)(t);try{for(a.s();!(n=a.n()).done;){var i=n.value;if(v(i.positions,e))return!0}}catch(o){a.e(o)}finally{a.f()}return!1}(t,n)},m=function(t,e){for(var n=0,a=Object.values(e.units);n<a.length;n++){var i=a[n];if(v(i.positions,t))return i}},g=Object(h.c)({name:"game",initialState:p,reducers:{moveUnit:function(t,e){if("action"===t.phase&&void 0!==t.selectedUnit){var n=t.units[t.selectedUnit];b(Object.values(t.units),n,e.payload)&&n.positions.push(e.payload),n.positions.length>n.stats.maxLength&&n.positions.shift()}},selectUnit:function(t,e){if("select"===t.phase){var n=m(e.payload,t);n&&(t.phase="action",t.selectedUnit=n.stats.id)}},cancel:function(t){t.selectedUnit=void 0,t.phase="select"},attack:function(t,e){var n=e.payload,a=m(n,t);if("action"===t.phase&&void 0!==t.selectedUnit&&a){var i=t.units[t.selectedUnit];i!==a&&function(t,e){var n=t.positions[t.positions.length-1];return Math.abs(n.x-e.x)+Math.abs(n.y-e.y)<=t.stats.range}(i,n)&&(i.stats.attack>=a.positions.length&&delete t.units[a.stats.id],a.positions.splice(0,i.stats.attack))}}}}),j=g.actions,y=j.moveUnit,x=j.selectUnit,O=j.cancel,w=j.attack,k=g.reducer,U=n(1),C=function(t){var e=t.position,n=t.color,a=l(),i=Object(u.c)((function(t){return t.game})).phase,o=function(t){switch(i){case"action":switch(t.button){case 0:a(y(e));break;case 2:a(w(e)),t.preventDefault()}break;case"select":a(x(e))}};return Object(U.jsx)("div",{style:{backgroundColor:n},onContextMenu:o,onClick:o,children:e.x+" "+e.y})},M=function(t,e){var n,a=Object(s.a)(e);try{for(a.s();!(n=a.n()).done;)for(var i=n.value,o=0;o<i.positions.length;o++){var r=i.positions[o];if(r.x===t.x&&r.y===t.y)return o===i.positions.length-1?i.stats.headColor:i.stats.color}}catch(c){a.e(c)}finally{a.f()}},S=function(t,e){return{x:Math.floor(t/e.width),y:t%e.height}},B=function(t,e){return Object(c.a)(Array(t.height*t.width).keys()).map((function(n){return Object(U.jsx)(C,{color:M(S(n,t),e),position:S(n,t)},n)}))};function A(){var t=l(),e=Object(u.c)((function(t){return t.game})),n=e.units,a=e.gridSize,o=e.phase,r=e.selectedUnit;return Object(U.jsxs)(i.a.Fragment,{children:[Object(U.jsxs)("p",{children:[o,void 0!==r?": "+n[r].stats.name:""]}),Object(U.jsx)("div",{className:f.a.wrapper,children:B(a,Object.values(n))}),Object(U.jsx)("button",{onClick:function(){return t(O())},children:"cancel"})]})}var L=function(){return Object(U.jsx)(A,{})},_=n(11),z=n.n(_),J=n(13);function R(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1;return new Promise((function(e){return setTimeout((function(){return e({data:t})}),500)}))}var W=Object(h.b)("counter/fetchCount",function(){var t=Object(J.a)(z.a.mark((function t(e){var n;return z.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,R(e);case 2:return n=t.sent,t.abrupt("return",n.data);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()),D=Object(h.c)({name:"counter",initialState:{value:0,status:"idle"},reducers:{increment:function(t){t.value+=1},decrement:function(t){t.value-=1},incrementByAmount:function(t,e){t.value+=e.payload}},extraReducers:function(t){t.addCase(W.pending,(function(t){t.status="loading"})).addCase(W.fulfilled,(function(t,e){t.status="idle",t.value+=e.payload}))}}),E=D.actions,F=(E.increment,E.decrement,E.incrementByAmount,D.reducer),G=Object(h.a)({reducer:{counter:F,game:k}});Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(Object(U.jsx)(i.a.StrictMode,{children:Object(U.jsx)(u.a,{store:G,children:Object(U.jsx)(L,{})})}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()})).catch((function(t){console.error(t.message)}))}},[[27,1,2]]]);
//# sourceMappingURL=main.c9f18eb6.chunk.js.map