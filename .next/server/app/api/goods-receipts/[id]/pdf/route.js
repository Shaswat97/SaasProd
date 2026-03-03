"use strict";(()=>{var e={};e.id=4799,e.ids=[4799],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},42665:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>h,patchFetch:()=>v,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>f,staticGenerationAsyncStorage:()=>b});var i={};n.r(i),n.d(i,{GET:()=>u,dynamic:()=>c});var a=n(49303),r=n(88716),s=n(60670),o=n(33360),l=n(92866),d=n(31021),p=n(60414);let c="force-dynamic";async function u(e,{params:t}){let n=await (0,o.KD)();if(!n)return(0,d.bg)("Tenant not found",404);let i=await (0,l.l)(n),a=await n.goodsReceipt.findFirst({where:{id:t.id,companyId:i},include:{vendor:!0,purchaseOrder:!0,lines:{include:{sku:!0}},company:!0}});if(!a)return new Response("Receipt not found",{status:404});let r=a.lines.reduce((e,t)=>e+t.totalCost,0),s=`
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Qty</th>
          <th class="num">Unit Cost</th>
          <th class="num">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${a.lines.map(e=>`<tr>
            <td>${(0,p.v_)(`${e.sku.code} \xb7 ${e.sku.name}`)}</td>
            <td>${(0,p.v_)(`${e.quantity} ${e.sku.unit}`)}</td>
            <td class="num">${(0,p.v_)((0,p.lb)(e.costPerUnit))}</td>
            <td class="num">${(0,p.v_)((0,p.lb)(e.totalCost))}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `,c=`
    <table class="totals">
      <tbody>
        <tr><td><strong>Total Receipt Value</strong></td><td class="num"><strong>${(0,p.v_)((0,p.lb)(r))}</strong></td></tr>
      </tbody>
    </table>
  `,u=`
    <strong>Vendor</strong>
    <div class="meta">${(0,p.v_)(a.vendor.name)}</div>
    <div class="meta">PO Number: ${(0,p.v_)(a.purchaseOrder.poNumber??a.purchaseOrderId)}</div>
    <div class="meta">Receipt ID: ${(0,p.v_)(a.id)}</div>
  `;return new Response((0,p.iF)({title:"Goods Receipt",docNumber:a.id,docDate:(0,p.p6)(a.receivedAt),company:a.company,partyBlock:u,bodyHtml:s,totalsHtml:c}),{headers:{"Content-Type":"text/html"}})}let m=new a.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/goods-receipts/[id]/pdf/route",pathname:"/api/goods-receipts/[id]/pdf",filename:"route",bundlePath:"app/api/goods-receipts/[id]/pdf/route"},resolvedPagePath:"/Users/shaswatsmac/Desktop/SaasProd/SaasProd/src/app/api/goods-receipts/[id]/pdf/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:b,serverHooks:f}=m,h="/api/goods-receipts/[id]/pdf/route";function v(){return(0,s.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:b})}},31021:(e,t,n)=>{n.d(t,{Yy:()=>s,bg:()=>r,uW:()=>a});var i=n(87070);function a(e,t){return i.NextResponse.json({ok:!0,data:e},t)}function r(e,t=400,n){return i.NextResponse.json({ok:!1,message:e,errors:n},{status:t})}function s(e){return r("Validation failed",400,e.issues.map(e=>({field:e.path.join("."),message:e.message})))}},60414:(e,t,n)=>{function i(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function a(e){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(e??0)}function r(e){if(!e)return"—";let t=e instanceof Date?e:new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-IN")}function s(e){return e.map(e=>String(e??"").trim()).filter(Boolean)}function o({title:e,docNumber:t,docDate:n,dueDate:a,company:r,partyBlock:o,bodyHtml:l,totalsHtml:d}){let p=r.printHeaderLine1||r.name,c=r.printHeaderLine2||"",u=s([r.billingLine1,r.billingLine2,r.billingCity,r.billingState,r.billingPostalCode,r.billingCountry]),m=r.printShowCompanyGstin??!0,g=r.printPreparedByLabel||"Prepared By",b=r.printAuthorizedByLabel||"Authorized Signatory",f=s([m&&r.gstin?`GSTIN: ${r.gstin}`:null,r.pan?`PAN: ${r.pan}`:null,r.cin?`CIN: ${r.cin}`:null,r.phone?`Phone: ${r.phone}`:null,r.email?`Email: ${r.email}`:null,r.website?`Web: ${r.website}`:null]),h=s([r.bankName?`Bank: ${r.bankName}`:null,r.bankBranch?`Branch: ${r.bankBranch}`:null,r.bankAccountName?`A/C Name: ${r.bankAccountName}`:null,r.bankAccountNumber?`A/C No: ${r.bankAccountNumber}`:null,r.bankIfsc?`IFSC: ${r.bankIfsc}`:null,r.bankUpiId?`UPI: ${r.bankUpiId}`:null]);return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${i(e)} ${i(t)}</title>
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
      <h2>${i(p)}</h2>
      ${c?`<p class="muted" style="margin-top:4px;">${i(c)}</p>`:""}
      <p class="title">${i(e)}</p>
      <p class="muted">${i(t)}</p>
    </div>
    <div class="box" style="min-width: 280px;">
      <div class="meta"><strong>Date:</strong> ${i(n??"—")}</div>
      ${a?`<div class="meta"><strong>Due Date:</strong> ${i(a)}</div>`:""}
      ${f.map(e=>`<div class="meta">${i(e)}</div>`).join("")}
    </div>
  </div>

  ${u.length?`<div class="section box"><strong>Billing Address</strong><div class="meta">${u.map(i).join("<br/>")}</div></div>`:""}
  ${o?`<div class="section box">${o}</div>`:""}

  <div class="section">${l}</div>
  ${d?`<div class="section">${d}</div>`:""}

  ${h.length?`<div class="section box"><strong>Bank Details</strong><div class="meta">${h.map(i).join("<br/>")}</div></div>`:""}
  ${r.printTerms?`<div class="section box"><strong>Terms & Conditions</strong><div class="meta">${i(r.printTerms).replaceAll("\n","<br/>")}</div></div>`:""}

  <div class="sig">
    <div class="sig-box">${i(g)}</div>
    <div class="sig-box">${i(b)}</div>
  </div>
  ${r.printFooterNote?`<div class="foot">${i(r.printFooterNote).replaceAll("\n","<br/>")}</div>`:""}
</body>
</html>`}n.d(t,{iF:()=>o,lb:()=>a,p6:()=>r,v_:()=>i})},33360:(e,t,n)=>{n.d(t,{KD:()=>s});var i=n(53524),a=n(92866);let r=globalThis.prisma??new i.PrismaClient({log:["error","warn"]});async function s(e){return await (0,a.n)(e)?r:null}},92866:(e,t,n)=>{n.d(t,{l:()=>r,n:()=>a});var i=n(71615);async function a(e){let t=e?.headers.get("host")??null;if(!t)try{t=(0,i.headers)().get("host")}catch{t="localhost"}return function(e){let t=process.env.DATABASE_URL;if(!t)throw Error("DATABASE_URL is not set in environment variables.");return{slug:"default",host:e,databaseUrl:t,source:"default"}}(t)}async function r(e){let t=await e.company.findFirst({where:{deletedAt:null},select:{id:!0}});if(!t)throw Error("No company found. Seed the database first.");return t.id}}};var t=require("../../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),i=t.X(0,[8948,1615,5972],()=>n(42665));module.exports=i})();