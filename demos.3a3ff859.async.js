"use strict";(self.webpackChunk_ant_design_cssinjs=self.webpackChunk_ant_design_cssinjs||[]).push([[433],{46056:function(P,_,e){e.r(_),e.d(_,{default:function(){return E}});var u=e(79800),c=e.n(u),d=e(21739),n=e(24108),l=e(79657),t=e(27174),r={primaryColor:"orange"};function E(){var o=d.useState({}),s=c()(o,2),v=s[1];return d.useEffect(function(){v({})},[]),(0,t.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,t.jsx)(n.default,{}),(0,t.jsx)(l.DesignTokenContext.Provider,{value:{token:r,hashed:!0},children:(0,t.jsx)(n.default,{})})]})}},82683:function(P,_,e){e.r(_),e.d(_,{default:function(){return r}});var u=e(79800),c=e.n(u),d=e(21739),n=e(9681),l=e(81453),t=e(27174);function r(){var E=d.useState(!0),o=c()(E,2),s=o[0],v=o[1],a=d.useState({}),m=c()(a,2),i=m[1];return d.useEffect(function(){i({})},[]),(0,t.jsx)(l.StyleProvider,{autoClear:!0,children:(0,t.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,t.jsx)("h3",{children:"\u914D\u7F6E\u540C\u6B65\u81EA\u52A8\u5220\u9664\u6DFB\u52A0\u7684\u6837\u5F0F"}),(0,t.jsxs)("label",{children:[(0,t.jsx)("input",{type:"checkbox",checked:s,onChange:function(){return v(!s)}}),"Show Components"]}),s&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.default,{children:"Default"}),(0,t.jsx)(n.default,{type:"primary",children:"Primary"}),(0,t.jsx)(n.default,{type:"ghost",children:"Ghost"})]})]})})}},86066:function(P,_,e){e.r(_),e.d(_,{default:function(){return r}});var u=e(79800),c=e.n(u),d=e(21739),n=e(9681),l=e(13385),t=e(27174);function r(){var E=d.useState(!0),o=c()(E,2),s=o[0],v=o[1],a=d.useState({}),m=c()(a,2),i=m[1];return d.useEffect(function(){i({})},[]),(0,t.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,t.jsx)("h3",{children:"\u9ED8\u8BA4\u60C5\u51B5\u4E0B\u4E0D\u4F1A\u81EA\u52A8\u5220\u9664\u6DFB\u52A0\u7684\u6837\u5F0F"}),(0,t.jsxs)("label",{children:[(0,t.jsx)("input",{type:"checkbox",checked:s,onChange:function(){return v(!s)}}),"Show Components"]}),s&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.default,{children:"Default"}),(0,t.jsx)(n.default,{type:"primary",children:"Primary"}),(0,t.jsx)(n.default,{type:"ghost",children:"Ghost"}),(0,t.jsx)(n.default,{className:"btn-override",children:"Override By ClassName"})]})]})}},58609:function(P,_,e){e.r(_),e.d(_,{default:function(){return E}});var u=e(79800),c=e.n(u),d=e(21739),n=e(13385),l=e(9681),t=e(79657),r=e(27174);function E(){var o=d.useState(!0),s=c()(o,2),v=s[0],a=s[1],m=d.useState({}),i=c()(m,2),x=i[1];return d.useEffect(function(){x({})},[]),(0,r.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,r.jsx)("h3",{children:"\u9ED8\u8BA4\u60C5\u51B5\u4E0B\u4E0D\u4F1A\u81EA\u52A8\u5220\u9664\u6DFB\u52A0\u7684\u6837\u5F0F"}),(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:v,onChange:function(){return a(!v)}}),"Show Components"]}),v&&(0,r.jsxs)("div",{children:[(0,r.jsxs)(t.DesignTokenContext.Provider,{value:{cssVar:{key:"default"},hashed:!0},children:[(0,r.jsx)(l.default,{children:"Default"}),(0,r.jsx)(l.default,{type:"primary",children:"Primary"}),(0,r.jsx)(l.default,{type:"ghost",children:"Ghost"}),(0,r.jsx)(l.default,{className:"btn-override",children:"Override By ClassName"})]}),(0,r.jsx)("br",{}),(0,r.jsxs)(t.DesignTokenContext.Provider,{value:{token:{primaryColor:"green"},cssVar:{key:"default2"},hashed:!0},children:[(0,r.jsx)(l.default,{children:"Default"}),(0,r.jsx)(l.default,{type:"primary",children:"Primary"}),(0,r.jsx)(l.default,{type:"ghost",children:"Ghost"}),(0,r.jsx)(l.default,{className:"btn-override",children:"Override By ClassName"})]})]})]})}},81722:function(P,_,e){e.r(_),e.d(_,{default:function(){return M}});var u=e(82242),c=e.n(u),d=e(79800),n=e.n(d),l=e(39647),t=e.n(l),r=e(85573),E=e.n(r),o=e(81453),s=e(92310),v=e.n(s),a=e(21739),m=e(79657),i=e(27174),x=["className"],h=function(g,b){return[E()({},".".concat(g),{width:20,height:20,backgroundColor:b.primaryColor,borderRadius:b.borderRadius})]},f=function(g,b){return[E()({},".".concat(g),{width:20,height:20,backgroundColor:b.primaryColor,borderRadius:b.borderRadius*3})]},D=function(g){return function(b){var R=b.className,B=t()(b,x),O="ant-box",W=(0,m.useToken)(),C=n()(W,3),U=C[0],T=C[1],A=C[2];return(0,o.useStyleRegister)({theme:U,token:T,hashId:A,path:[O]},function(){return[g(O,T)]}),(0,i.jsx)("div",c()({className:v()(O,A,R)},B))}},y=D(h),p=D(f);function M(){return(0,i.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,i.jsx)("h3",{children:"\u76F8\u540C Token \u4E0D\u540C Salt \u4E92\u4E0D\u51B2\u7A81"}),(0,i.jsxs)("div",{style:{display:"flex",columnGap:8},children:[(0,i.jsx)(m.DesignTokenContext.Provider,{value:{hashed:"123"},children:(0,i.jsx)(y,{})}),(0,i.jsx)(m.DesignTokenContext.Provider,{value:{hashed:"234"},children:(0,i.jsx)(p,{})})]})]})}},94900:function(P,_,e){e.r(_),e.d(_,{default:function(){return o}});var u=e(79800),c=e.n(u),d=e(21739),n=e(9681),l=e(24108),t=e(79657),r=e(27174),E=function(){return"#".concat(Math.floor(Math.random()*16777215).toString(16).padStart(6,"0"))};function o(){var s=d.useState(!0),v=c()(s,2),a=v[0],m=v[1],i=d.useState(E()),x=c()(i,2),h=x[0],f=x[1];return(0,r.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,r.jsx)("h3",{children:"\u968F\u673A\u6837\u5F0F\uFF0C\u65B0\u7684 Token \u751F\u6210\u5220\u9664\u539F\u672C\u7684\u5168\u90E8 style"}),(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:a,onChange:function(){return m(!a)}}),"Show Components"]}),(0,r.jsx)(t.DesignTokenContext.Provider,{value:{token:{primaryColor:h}},children:a&&(0,r.jsxs)("div",{style:{display:"flex",columnGap:8},children:[(0,r.jsx)(n.default,{type:"primary",onClick:function(){return f(E())},children:"Random Primary Color"}),(0,r.jsx)(l.default,{})]})})]})}},74007:function(P,_,e){e.r(_),e.d(_,{default:function(){return m}});var u=e(82242),c=e.n(u),d=e(39647),n=e.n(d),l=e(81453),t=e(92310),r=e.n(t),E=e(21739),o=e(27174),s=["className"],v=new l.Theme([function(){return{}}]),a=function(x){var h=x.className,f=n()(x,s);return(0,l.useStyleRegister)({theme:v,token:{_tokenKey:"test"},path:["layer"],layer:{name:"layer",dependencies:["shared"]}},function(){return{".layer-div":{color:"blue",a:{color:"pink",cursor:"pointer","&:hover":{color:"red"}}}}}),(0,l.useStyleRegister)({theme:v,token:{_tokenKey:"test"},path:["shared"],layer:{name:"shared"}},function(){return{"html body .layer-div":{color:"green"}}}),(0,o.jsx)("div",c()({className:r()(h,"layer-div")},f))};function m(){return(0,o.jsx)(l.StyleProvider,{layer:!0,children:(0,o.jsxs)(a,{children:["Text should be blue.",(0,o.jsxs)("div",{children:["The link should be ",(0,o.jsx)("a",{children:"pink"})]})]})})}},97368:function(P,_,e){e.r(_);var u=e(81453),c=e(21739),d=e(27174),n=function(){return(0,u.useStyleRegister)({theme:(0,u.createTheme)(function(){return{}}),token:{},path:[".logical-properties-box"]},function(){return{".logical-properties-box":{width:"300px",height:100,backgroundColor:"pink",border:"1px solid #000",position:"relative",paddingInline:10,borderBlockEndWidth:3,marginBlock:10,borderEndEndRadius:"50%",inset:5}}}),(0,d.jsx)("div",{className:"logical-properties-box",children:"logicalProperties"})},l=function(){return(0,d.jsx)(u.StyleProvider,{transformers:[u.legacyLogicalPropertiesTransformer],children:(0,d.jsx)(n,{})})};_.default=l},40565:function(P,_,e){e.r(_);var u=e(81453),c=e(21739),d=e(27174),n=function(){return(0,u.useStyleRegister)({theme:(0,u.createTheme)(function(){return{}}),token:{},path:[".px2rem-box"]},function(){return{".px2rem-box":{width:"400px",backgroundColor:"green",fontSize:"32px",border:"10PX solid #f0f",color:"white"},"@media only screen and (max-width: 600px)":{".px2rem-box":{backgroundColor:"red"}}}}),(0,d.jsx)("div",{className:"px2rem-box",children:"px2rem"})},l=function(){return(0,d.jsx)(u.StyleProvider,{transformers:[(0,u.px2remTransformer)()],children:(0,d.jsx)(n,{})})};_.default=l},92962:function(P,_,e){e.r(_),e.d(_,{default:function(){return t}});var u=e(21739),c=e(9681),d=e(79657),n=e(27174),l=function(){return(0,n.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,n.jsx)(c.default,{children:"Default"}),(0,n.jsx)(c.default,{type:"primary",children:"Primary"}),(0,n.jsx)(c.default,{type:"ghost",children:"Ghost"})]})};function t(){var r={primaryColor:"red"},E={primaryColor:"orange"};return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",rowGap:8},children:[(0,n.jsx)("h3",{children:"\u6DF7\u5408 SeedToken"}),(0,n.jsx)(l,{}),(0,n.jsx)(d.DesignTokenContext.Provider,{value:{token:r,hashed:!0},children:(0,n.jsx)(l,{})}),(0,n.jsx)(d.DesignTokenContext.Provider,{value:{token:E,hashed:!0},children:(0,n.jsx)(l,{})})]})}},9120:function(P,_,e){e.r(_),e.d(_,{default:function(){return s}});var u=e(79800),c=e.n(u),d=e(81453),n=e(21739),l=e(17131),t=e(9681),r=e(24108),E=e(79657),o=e(27174);function s(){var v=n.useState(!0),a=c()(v,2),m=a[0],i=a[1],x=n.useRef(null);return n.useEffect(function(){var h;if(m){var f=document.createElement("div");(h=x.current)===null||h===void 0||(h=h.parentElement)===null||h===void 0||h.appendChild(f);var D=f.attachShadow({mode:"open"}),y=document.createElement("div");y.id="reactRoot",D.appendChild(y);var p=(0,l.createRoot)(y);return p.render((0,o.jsx)(n.StrictMode,{children:(0,o.jsx)(E.DesignTokenContext.Provider,{value:{hashed:!0},children:(0,o.jsx)(d.StyleProvider,{container:D,cache:(0,d.createCache)(),children:(0,o.jsxs)("div",{style:{border:"6px solid #000",padding:8},children:[(0,o.jsx)("h1",{children:"Shadow Root!"}),(0,o.jsx)(t.default,{type:"primary",children:"Hello World!"}),(0,o.jsx)(r.default,{})]})})})})),function(){f.remove()}}},[m]),(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("button",{onClick:function(){i(!m)},children:["Trigger ",String(m)]}),(0,o.jsx)("p",{ref:x})]})}},80767:function(P,_,e){e.r(_),e.d(_,{Demo:function(){return m},default:function(){return x}});var u=e(79800),c=e.n(u),d=e(82242),n=e.n(d),l=e(81453),t=e(21739),r=e(17131),E=e(44291),o=e(9681),s=e(24108),v=e(79657),a=e(27174),m=function(){var f={onClick:function(y){var p=y.target;console.log("Click:",p)}};return(0,a.jsxs)("div",{style:{display:"flex",columnGap:8},children:[new Array(3).fill(0).map(function(D,y){return(0,a.jsxs)(o.default,n()(n()({},f),{},{type:"ghost",children:["Button ",y+1]}),y)}),(0,a.jsx)(s.default,{}),(0,a.jsxs)(v.DesignTokenContext.Provider,{value:{token:{primaryColor:"red"},hashed:!0},children:[(0,a.jsx)(o.default,n()(n()({},f),{},{type:"ghost",children:"Button"})),(0,a.jsx)(s.default,{})]}),(0,a.jsxs)(v.DesignTokenContext.Provider,{value:{token:{primaryColor:"green"},hashed:"v5"},children:[(0,a.jsx)(o.default,n()(n()({},f),{},{type:"ghost",children:"Button"})),(0,a.jsx)(s.default,{})]})]})},i=function(f){var D=f.children;return(0,a.jsx)("pre",{style:{background:"#FFF",padding:8,whiteSpace:"pre-wrap",wordBreak:"break-word"},children:D})};function x(){var h=t.useRef((0,l.createCache)()),f=t.useMemo(function(){var j=(0,E.renderToString)((0,a.jsx)(l.StyleProvider,{mock:"server",cache:h.current,children:(0,a.jsx)(m,{})})),g=(0,l.extractStyle)(h.current),b=(0,l.extractStyle)(h.current,!0);return console.log("cache:",h.current),[j,g,b]},[]),D=c()(f,3),y=D[0],p=D[1],M=D[2];return t.useEffect(function(){console.log("Prepare env...");var j=document.createElement("div");return document.body.appendChild(j),j.innerHTML=y,setTimeout(function(){var g=document.createElement("div");g.innerHTML=p,Array.from(g.childNodes).forEach(function(b){document.head.appendChild(b)}),setTimeout(function(){console.log("Hydrate..."),(0,r.hydrateRoot)(j,(0,a.jsx)(l.StyleProvider,{cache:(0,l.createCache)(),children:(0,a.jsx)(m,{})}))},500)},50),function(){document.body.removeChild(j)}},[]),(0,a.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,a.jsx)("h3",{children:"\u670D\u52A1\u7AEF\u6E32\u67D3\u63D0\u524D\u83B7\u53D6\u6240\u6709\u6837\u5F0F"}),(0,a.jsx)(i,{children:M}),(0,a.jsx)(i,{children:p}),(0,a.jsx)(i,{children:y}),(0,a.jsx)("h4",{children:"SSR Style"}),(0,a.jsx)("div",{id:"ssr",dangerouslySetInnerHTML:{__html:y}}),(0,a.jsx)("div",{className:"ant-cssinjs-cache-path"})]})}},78402:function(P,_,e){e.r(_),e.d(_,{default:function(){return o}});var u=e(79800),c=e.n(u),d=e(81453),n=e(21739),l=e(17131),t=e(30106),r=e(27174),E=`
<div style="display:flex;column-gap:8px"><button class="ant-btn ant-btn-ghost">Button <!-- -->1</button><button class="ant-btn ant-btn-ghost">Button <!-- -->2</button><button class="ant-btn ant-btn-ghost">Button <!-- -->3</button><div class="ant-spin"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-11z9nrm">Button</button><div class="ant-spin css-dev-only-do-not-override-11z9nrm"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-s8g2cg">Button</button><div class="ant-spin css-dev-only-do-not-override-s8g2cg"></div></div>
`.trim();function o(){var s=n.useState(!1),v=c()(s,2),a=v[0],m=v[1];return n.useEffect(function(){if(a){console.clear();var i=document.createElement("div");return i.innerHTML=E,document.body.appendChild(i),console.log("\u{1F976} Hydrating..."),(0,l.hydrateRoot)(i,(0,r.jsx)(d.StyleProvider,{cache:(0,d.createCache)(),children:(0,r.jsx)(t.Demo,{})})),function(){document.body.removeChild(i)}}},[a]),(0,r.jsx)("button",{onClick:function(){m(!1),setTimeout(function(){m(!0)},100)},children:"Render"})}},68321:function(P,_,e){e.r(_),e.d(_,{default:function(){return v}});var u=e(79800),c=e.n(u),d=e(81453),n=e(21739),l=e(17131),t=e(30106),r=e(27174),E=`
<div style="display:flex;column-gap:8px"><button class="ant-btn ant-btn-ghost">Button <!-- -->1</button><button class="ant-btn ant-btn-ghost">Button <!-- -->2</button><button class="ant-btn ant-btn-ghost">Button <!-- -->3</button><div class="ant-spin"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-11z9nrm">Button</button><div class="ant-spin css-dev-only-do-not-override-11z9nrm"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-s8g2cg">Button</button><div class="ant-spin css-dev-only-do-not-override-s8g2cg"></div></div>
`.trim(),o=`
<style data-token-hash="4ztxvs" data-css-hash="5d348p">.ant-btn-default{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}.ant-btn-default:hover{opacity:0.6;}.ant-btn-default:active{opacity:0.3;}.ant-btn-default{background-color:#FFFFFF;color:#333333;}.ant-btn-default:hover{border-color:#1890ff;color:#1890ff;}.ant-btn-primary{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}.ant-btn-primary:hover{opacity:0.6;}.ant-btn-primary:active{opacity:0.3;}.ant-btn-primary{background-color:#1890ff;border:1px solid #1890ff;color:#FFFFFF;}.ant-btn-primary:hover{background-color:rgba(24, 144, 255, 0.5);}.ant-btn-ghost{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}.ant-btn-ghost:hover{opacity:0.6;}.ant-btn-ghost:active{opacity:0.3;}.ant-btn-ghost{background-color:transparent;color:#1890ff;border:1px solid #1890ff;}.ant-btn-ghost:hover{border-color:#1890ff;color:#1890ff;}</style><style data-token-hash="4ztxvs" data-css-hash="3dk1gi">.ant-spin{width:20px;height:20px;background-color:#1890ff;animation-name:loadingCircle;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;}</style><style data-token-hash="4ztxvs" data-css-hash="_effect-loadingCircle">@keyframes loadingCircle{to{transform:rotate(360deg);}}</style><style data-token-hash="1hednoc" data-css-hash="tqroew">:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default:active{opacity:0.3;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default{background-color:#FFFFFF;color:#333333;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default:hover{border-color:red;color:red;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary:active{opacity:0.3;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary{background-color:red;border:1px solid red;color:#FFFFFF;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary:hover{background-color:rgba(255, 0, 0, 0.5);}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost:active{opacity:0.3;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost{background-color:transparent;color:red;border:1px solid red;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost:hover{border-color:red;color:red;}</style><style data-token-hash="1hednoc" data-css-hash="5avnn1">:where(.css-dev-only-do-not-override-11z9nrm).ant-spin{width:20px;height:20px;background-color:red;animation-name:css-dev-only-do-not-override-11z9nrm-loadingCircle;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;}</style><style data-token-hash="1hednoc" data-css-hash="_effect-css-dev-only-do-not-override-11z9nrm-loadingCircle">@keyframes css-dev-only-do-not-override-11z9nrm-loadingCircle{to{transform:rotate(360deg);}}</style><style data-token-hash="xhw1a7" data-css-hash="521jz7">:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default:active{opacity:0.3;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default{background-color:#FFFFFF;color:#333333;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default:hover{border-color:green;color:green;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary:active{opacity:0.3;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary{background-color:green;border:1px solid green;color:#FFFFFF;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary:hover{background-color:rgba(0, 128, 0, 0.5);}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost:active{opacity:0.3;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost{background-color:transparent;color:green;border:1px solid green;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost:hover{border-color:green;color:green;}</style><style data-token-hash="xhw1a7" data-css-hash="1talicu">:where(.css-dev-only-do-not-override-s8g2cg).ant-spin{width:20px;height:20px;background-color:green;animation-name:css-dev-only-do-not-override-s8g2cg-loadingCircle;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;}</style><style data-token-hash="xhw1a7" data-css-hash="_effect-css-dev-only-do-not-override-s8g2cg-loadingCircle">@keyframes css-dev-only-do-not-override-s8g2cg-loadingCircle{to{transform:rotate(360deg);}}</style><style data-ant-cssinjs-cache-path="data-ant-cssinjs-cache-path">.data-ant-cssinjs-cache-path{content:"4ztxvs|ant-btn:5d348p;4ztxvs|ant-spin:3dk1gi;1hednoc|ant-btn:tqroew;1hednoc|ant-spin:5avnn1;xhw1a7|ant-btn:521jz7;xhw1a7|ant-spin:1talicu";}</style>
`.trim(),s=!1;function v(){var a=n.useState(!1),m=c()(a,2),i=m[0],x=m[1];return n.useEffect(function(){if(i){console.clear();var h=document.createElement("div");return h.innerHTML=E,document.body.appendChild(h),s||(document.head.innerHTML=o,s=!0),console.log("\u{1F976} Hydrating..."),(0,l.hydrateRoot)(h,(0,r.jsx)(d.StyleProvider,{cache:(0,d.createCache)(),children:(0,r.jsx)(t.Demo,{})})),function(){document.body.removeChild(h)}}},[i]),(0,r.jsx)("button",{onClick:function(){x(!1),setTimeout(function(){x(!0)},100)},children:"Render"})}},44525:function(P,_,e){e.r(_),e.d(_,{default:function(){return m}});var u=e(82242),c=e.n(u),d=e(21739),n=e(67820),l=e(44291),t=e(81453),r=e(9681),E=e(24108),o=e(79657),s=e(27174),v=function(){var x={onClick:function(f){var D=f.target;console.log("Click:",D)}};return(0,s.jsxs)("div",{style:{display:"flex",columnGap:8},children:[new Array(3).fill(0).map(function(h,f){return(0,s.jsxs)(r.default,c()(c()({},x),{},{type:"ghost",children:["Button ",f+1]}),f)}),(0,s.jsx)(E.default,{}),(0,s.jsxs)(o.DesignTokenContext.Provider,{value:{token:{primaryColor:"red"},hashed:!0},children:[(0,s.jsx)(r.default,c()(c()({},x),{},{type:"ghost",children:"Button"})),(0,s.jsx)(E.default,{})]}),(0,s.jsxs)(o.DesignTokenContext.Provider,{value:{token:{primaryColor:"green"},hashed:"v5"},children:[(0,s.jsx)(r.default,c()(c()({},x),{},{type:"ghost",children:"Button"})),(0,s.jsx)(E.default,{})]})]})},a=function(x){var h=x.children;return(0,s.jsx)("pre",{style:{background:"#FFF",padding:8,whiteSpace:"pre-wrap",wordBreak:"break-word"},children:h})};function m(){var i=d.useMemo(function(){return(0,l.renderToString)((0,s.jsx)(t.StyleProvider,{mock:"server",children:(0,s.jsx)(v,{})}))},[]);return d.useEffect(function(){setTimeout(function(){console.log("Hydrate...");var x=document.getElementById("ssr");(0,n.hydrate)((0,s.jsx)(t.StyleProvider,{cache:(0,t.createCache)(),children:(0,s.jsx)(v,{})}),x)},500)},[]),(0,s.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,s.jsx)("h3",{children:"\u670D\u52A1\u7AEF\u6E32\u67D3\u63D0\u524D\u83B7\u53D6\u6240\u6709\u6837\u5F0F"}),(0,s.jsx)(a,{children:i}),(0,s.jsx)("div",{id:"ssr",dangerouslySetInnerHTML:{__html:i}})]})}},16836:function(P,_,e){e.r(_),e.d(_,{default:function(){return m}});var u=e(79800),c=e.n(u),d=e(82242),n=e.n(d),l=e(21739),t=e(9681),r=e(79657),E=e(81453),o=e(27174);function s(i){return n()(n()({},i),{},{primaryColor:"red",primaryColorDisabled:"red"})}function v(i){return n()(n()({},i),{},{primaryColor:"green",primaryColorDisabled:"green"})}var a=function(){return(0,o.jsxs)("div",{style:{background:"rgba(0,0,0,0.1)",padding:16},children:[(0,o.jsx)(t.default,{children:"Default"}),(0,o.jsx)(t.default,{type:"primary",children:"Primary"}),(0,o.jsx)(t.default,{type:"ghost",children:"Ghost"})]})};function m(){var i=l.useState({}),x=c()(i,2),h=x[1];return(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",rowGap:8},children:[(0,o.jsx)("h3",{children:"\u6DF7\u5408\u4E3B\u9898"}),(0,o.jsxs)(r.DesignTokenContext.Provider,{value:{hashed:!0},children:[(0,o.jsx)(a,{}),(0,o.jsx)(r.ThemeContext.Provider,{value:(0,E.createTheme)(s),children:(0,o.jsx)(a,{})}),(0,o.jsx)(r.ThemeContext.Provider,{value:(0,E.createTheme)(v),children:(0,o.jsx)(a,{})})]}),(0,o.jsx)("button",{onClick:function(){h({})},children:"Force ReRender"})]})}}}]);