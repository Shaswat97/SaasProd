"use strict";(()=>{var e={};e.id=370,e.ids=[370],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1209:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>b,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>v});var n={};i.r(n),i.d(n,{GET:()=>u,dynamic:()=>c});var s=i(49303),a=i(88716),r=i(60670),l=i(33360),o=i(92866),d=i(31021),p=i(60414);let c="force-dynamic";async function u(e,{params:t}){let i=await (0,l.KD)();if(!i)return(0,d.bg)("Tenant not found",404);let n=await (0,o.l)(i),s=await i.salesOrderDelivery.findFirst({where:{id:t.deliveryId,salesOrderId:t.id,companyId:n},include:{line:{include:{sku:!0}},salesOrder:{include:{customer:!0,company:!0,lines:{include:{sku:!0}},deliveries:{include:{line:{include:{sku:!0}}}}}}}});if(!s)return new Response("Delivery not found",{status:404});let a=s.salesOrder,r=a.company,c=new Map;for(let e of a.deliveries)c.set(e.soLineId,(c.get(e.soLineId)??0)+e.quantity);let u=`
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th class="num">Ordered</th>
          <th class="num">Shipped (This Delivery)</th>
          <th class="num">Unit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${(0,p.v_)(`${s.line.sku.code} \xb7 ${s.line.sku.name}`)}</td>
          <td class="num">${(0,p.v_)(String(s.line.quantity))}</td>
          <td class="num">${(0,p.v_)(String(s.quantity))}</td>
          <td class="num">${(0,p.v_)(s.line.sku.unit)}</td>
        </tr>
      </tbody>
    </table>
  `,m=a.lines.map(e=>{let t=c.get(e.id)??0,i=Math.max(e.quantity-t,0);return{line:e,totalDelivered:t,remaining:i}}).filter(e=>e.remaining>0),g=m.length>0?`
    <div class="section">
      <p style="font-size:13px; font-weight:600; margin-bottom:6px;">Pending Shipments</p>
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th class="num">Ordered</th>
            <th class="num">Shipped So Far</th>
            <th class="num">Still Pending</th>
            <th class="num">Unit</th>
          </tr>
        </thead>
        <tbody>
          ${m.map(({line:e,totalDelivered:t,remaining:i})=>`
            <tr>
              <td>${(0,p.v_)(`${e.sku.code} \xb7 ${e.sku.name}`)}</td>
              <td class="num">${(0,p.v_)(String(e.quantity))}</td>
              <td class="num">${(0,p.v_)(String(t))}</td>
              <td class="num" style="color:#c07000; font-weight:600;">${(0,p.v_)(String(i))}</td>
              <td class="num">${(0,p.v_)(e.sku.unit)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      <p style="font-size:11px; color:#6b637d; margin-top:8px;">
        Remaining items will be shipped in subsequent deliveries. 
        Please contact us if you have any questions.
      </p>
    </div>`:`<div class="section box" style="color:#166534; font-size:12px;">
           ✓ All items in this order have been shipped with this delivery.
         </div>`,v=`
    <strong>Deliver To</strong>
    <div class="meta">${(0,p.v_)(a.customer.name)}</div>
    <div class="meta">Sales Order: ${(0,p.v_)(a.soNumber??a.id)}</div>
    <div class="meta">Delivery Date: ${(0,p.v_)((0,p.p6)(s.deliveryDate))}</div>
    ${s.notes?`<div class="meta">Notes: ${(0,p.v_)(s.notes)}</div>`:""}
  `,h=`
    <p style="font-size:13px; font-weight:600; margin-bottom:6px;">Items Shipped</p>
    ${u}
    ${s.packagingCost>0?`<p style="font-size:12px; color:#6b637d; margin-top:6px;">Packaging / Logistics cost included in invoice: ${s.packagingCost.toLocaleString("en-IN")}</p>`:""}
    ${g}
  `;return new Response((0,p.iF)({title:"Delivery Note",docNumber:`DN-${t.deliveryId.slice(-8).toUpperCase()}`,docDate:(0,p.p6)(s.deliveryDate),company:r,partyBlock:v,bodyHtml:h}),{headers:{"Content-Type":"text/html"}})}let m=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/sales-orders/[id]/deliveries/[deliveryId]/packing-slip/route",pathname:"/api/sales-orders/[id]/deliveries/[deliveryId]/packing-slip",filename:"route",bundlePath:"app/api/sales-orders/[id]/deliveries/[deliveryId]/packing-slip/route"},resolvedPagePath:"/Users/shaswatsmac/Desktop/SaasProd/SaasProd/src/app/api/sales-orders/[id]/deliveries/[deliveryId]/packing-slip/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:g,staticGenerationAsyncStorage:v,serverHooks:h}=m,b="/api/sales-orders/[id]/deliveries/[deliveryId]/packing-slip/route";function f(){return(0,r.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:v})}},31021:(e,t,i)=>{i.d(t,{Yy:()=>r,bg:()=>a,uW:()=>s});var n=i(87070);function s(e,t){return n.NextResponse.json({ok:!0,data:e},t)}function a(e,t=400,i){return n.NextResponse.json({ok:!1,message:e,errors:i},{status:t})}function r(e){return a("Validation failed",400,e.issues.map(e=>({field:e.path.join("."),message:e.message})))}},60414:(e,t,i)=>{function n(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function s(e){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(e??0)}function a(e){if(!e)return"—";let t=e instanceof Date?e:new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-IN")}function r(e){return e.map(e=>String(e??"").trim()).filter(Boolean)}function l({title:e,docNumber:t,docDate:i,dueDate:s,company:a,partyBlock:l,bodyHtml:o,totalsHtml:d}){let p=a.printHeaderLine1||a.name,c=a.printHeaderLine2||"",u=r([a.billingLine1,a.billingLine2,a.billingCity,a.billingState,a.billingPostalCode,a.billingCountry]),m=a.printShowCompanyGstin??!0,g=a.printPreparedByLabel||"Prepared By",v=a.printAuthorizedByLabel||"Authorized Signatory",h=r([m&&a.gstin?`GSTIN: ${a.gstin}`:null,a.pan?`PAN: ${a.pan}`:null,a.cin?`CIN: ${a.cin}`:null,a.phone?`Phone: ${a.phone}`:null,a.email?`Email: ${a.email}`:null,a.website?`Web: ${a.website}`:null]),b=r([a.bankName?`Bank: ${a.bankName}`:null,a.bankBranch?`Branch: ${a.bankBranch}`:null,a.bankAccountName?`A/C Name: ${a.bankAccountName}`:null,a.bankAccountNumber?`A/C No: ${a.bankAccountNumber}`:null,a.bankIfsc?`IFSC: ${a.bankIfsc}`:null,a.bankUpiId?`UPI: ${a.bankUpiId}`:null]);return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${n(e)} ${n(t)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1f1b2d; padding: 28px; margin: 0; }
    h1, h2, h3, p { margin: 0; }
    .row { display: flex; justify-content: space-between; gap: 24px; }
    .muted { color: #6b637d; font-size: 12px; }
    .title { font-size: 30px; font-weight: 700; margin-top: 10px; }
    .box { border: 1px solid #ddd2f5; border-radius: 12px; padding: 12px; background: #fcfaff; }
    .meta { font-size: 12px; line-height: 1.6; margin-top: 8px; }
    .section { margin-top: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd2f5; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
    th { background: #f4efff; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
    .num { text-align: right; white-space: nowrap; }
    .totals { margin-top: 12px; margin-left: auto; width: 320px; }
    .totals td { padding: 7px 10px; }
    .sig { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
    .sig-box { min-height: 64px; border-top: 1px dashed #b7aacd; padding-top: 8px; font-size: 12px; color: #5a4f70; }
    .foot { margin-top: 16px; font-size: 11px; color: #6b637d; }
  </style>
</head>
<body>
  <div class="row">
    <div>
      <h2>${n(p)}</h2>
      ${c?`<p class="muted" style="margin-top:4px;">${n(c)}</p>`:""}
      <p class="title">${n(e)}</p>
      <p class="muted">${n(t)}</p>
    </div>
    <div class="box" style="min-width: 280px;">
      <div class="meta"><strong>Date:</strong> ${n(i??"—")}</div>
      ${s?`<div class="meta"><strong>Due Date:</strong> ${n(s)}</div>`:""}
      ${h.map(e=>`<div class="meta">${n(e)}</div>`).join("")}
    </div>
  </div>

  ${u.length?`<div class="section box"><strong>Billing Address</strong><div class="meta">${u.map(n).join("<br/>")}</div></div>`:""}
  ${l?`<div class="section box">${l}</div>`:""}

  <div class="section">${o}</div>
  ${d?`<div class="section">${d}</div>`:""}

  ${b.length?`<div class="section box"><strong>Bank Details</strong><div class="meta">${b.map(n).join("<br/>")}</div></div>`:""}
  ${a.printTerms?`<div class="section box"><strong>Terms & Conditions</strong><div class="meta">${n(a.printTerms).replaceAll("\n","<br/>")}</div></div>`:""}

  <div class="sig">
    <div class="sig-box">${n(g)}</div>
    <div class="sig-box">${n(v)}</div>
  </div>
  ${a.printFooterNote?`<div class="foot">${n(a.printFooterNote).replaceAll("\n","<br/>")}</div>`:""}
</body>
</html>`}i.d(t,{iF:()=>l,lb:()=>s,p6:()=>a,v_:()=>n})},33360:(e,t,i)=>{i.d(t,{KD:()=>r});var n=i(53524),s=i(92866);let a=globalThis.prisma??new n.PrismaClient({log:["error","warn"]});async function r(e){return await (0,s.n)(e)?a:null}},92866:(e,t,i)=>{i.d(t,{l:()=>a,n:()=>s});var n=i(71615);async function s(e){let t=e?.headers.get("host")??null;if(!t)try{t=(0,n.headers)().get("host")}catch{t="localhost"}return function(e){let t=process.env.DATABASE_URL;if(!t)throw Error("DATABASE_URL is not set in environment variables.");return{slug:"default",host:e,databaseUrl:t,source:"default"}}(t)}async function a(e){let t=await e.company.findFirst({where:{deletedAt:null},select:{id:!0}});if(!t)throw Error("No company found. Seed the database first.");return t.id}}};var t=require("../../../../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),n=t.X(0,[8948,1615,5972],()=>i(1209));module.exports=n})();