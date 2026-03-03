"use strict";(()=>{var t={};t.id=4502,t.ids=[4502],t.modules={53524:t=>{t.exports=require("@prisma/client")},72934:t=>{t.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:t=>{t.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:t=>{t.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},23480:(t,e,n)=>{n.r(e),n.d(e,{originalPathname:()=>f,patchFetch:()=>h,requestAsyncStorage:()=>b,routeModule:()=>m,serverHooks:()=>v,staticGenerationAsyncStorage:()=>g});var i={};n.r(i),n.d(i,{GET:()=>u,dynamic:()=>c});var a=n(49303),r=n(88716),s=n(60670),o=n(33360),l=n(92866),d=n(31021),p=n(60414);let c="force-dynamic";async function u(t,{params:e}){let n=await (0,o.KD)();if(!n)return(0,d.bg)("Tenant not found",404);let i=await (0,l.l)(n),a=await n.vendorBill.findFirst({where:{id:e.id,companyId:i},include:{vendor:!0,purchaseOrder:!0,lines:{include:{sku:!0}},company:!0}});if(!a)return new Response("Vendor bill not found",{status:404});let r=a.lines.reduce((t,e)=>t+e.totalCost,0),s=`
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${a.lines.map(t=>`<tr>
            <td>${(0,p.v_)(`${t.sku.code} \xb7 ${t.sku.name}`)}</td>
            <td>${(0,p.v_)(`${t.quantity} ${t.sku.unit}`)}</td>
            <td class="num">${(0,p.v_)((0,p.lb)(t.unitPrice))}</td>
            <td class="num">${(0,p.v_)((0,p.lb)(t.totalCost))}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `,c=`
    <table class="totals">
      <tbody>
        <tr><td>Bill Total</td><td class="num">${(0,p.v_)((0,p.lb)(r))}</td></tr>
        <tr><td>Outstanding</td><td class="num">${(0,p.v_)((0,p.lb)(a.balanceAmount??r))}</td></tr>
      </tbody>
    </table>
  `,u=`
    <strong>Vendor</strong>
    <div class="meta">${(0,p.v_)(a.vendor.name)}</div>
    <div class="meta">PO: ${(0,p.v_)(a.purchaseOrder?.poNumber??a.purchaseOrderId??"—")}</div>
    <div class="meta">Status: ${(0,p.v_)(a.status)}</div>
  `;return new Response((0,p.iF)({title:"Vendor Bill",docNumber:a.billNumber??a.id,docDate:(0,p.p6)(a.billDate),dueDate:a.dueDate?(0,p.p6)(a.dueDate):void 0,company:a.company,partyBlock:u,bodyHtml:s,totalsHtml:c}),{headers:{"Content-Type":"text/html"}})}let m=new a.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/vendor-bills/[id]/pdf/route",pathname:"/api/vendor-bills/[id]/pdf",filename:"route",bundlePath:"app/api/vendor-bills/[id]/pdf/route"},resolvedPagePath:"/Users/shaswatsmac/Desktop/SaasProd/SaasProd/src/app/api/vendor-bills/[id]/pdf/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:b,staticGenerationAsyncStorage:g,serverHooks:v}=m,f="/api/vendor-bills/[id]/pdf/route";function h(){return(0,s.patchFetch)({serverHooks:v,staticGenerationAsyncStorage:g})}},31021:(t,e,n)=>{n.d(e,{Yy:()=>s,bg:()=>r,uW:()=>a});var i=n(87070);function a(t,e){return i.NextResponse.json({ok:!0,data:t},e)}function r(t,e=400,n){return i.NextResponse.json({ok:!1,message:t,errors:n},{status:e})}function s(t){return r("Validation failed",400,t.issues.map(t=>({field:t.path.join("."),message:t.message})))}},60414:(t,e,n)=>{function i(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function a(t){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(t??0)}function r(t){if(!t)return"—";let e=t instanceof Date?t:new Date(t);return Number.isNaN(e.getTime())?"—":e.toLocaleDateString("en-IN")}function s(t){return t.map(t=>String(t??"").trim()).filter(Boolean)}function o({title:t,docNumber:e,docDate:n,dueDate:a,company:r,partyBlock:o,bodyHtml:l,totalsHtml:d}){let p=r.printHeaderLine1||r.name,c=r.printHeaderLine2||"",u=s([r.billingLine1,r.billingLine2,r.billingCity,r.billingState,r.billingPostalCode,r.billingCountry]),m=r.printShowCompanyGstin??!0,b=r.printPreparedByLabel||"Prepared By",g=r.printAuthorizedByLabel||"Authorized Signatory",v=s([m&&r.gstin?`GSTIN: ${r.gstin}`:null,r.pan?`PAN: ${r.pan}`:null,r.cin?`CIN: ${r.cin}`:null,r.phone?`Phone: ${r.phone}`:null,r.email?`Email: ${r.email}`:null,r.website?`Web: ${r.website}`:null]),f=s([r.bankName?`Bank: ${r.bankName}`:null,r.bankBranch?`Branch: ${r.bankBranch}`:null,r.bankAccountName?`A/C Name: ${r.bankAccountName}`:null,r.bankAccountNumber?`A/C No: ${r.bankAccountNumber}`:null,r.bankIfsc?`IFSC: ${r.bankIfsc}`:null,r.bankUpiId?`UPI: ${r.bankUpiId}`:null]);return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${i(t)} ${i(e)}</title>
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
      <p class="title">${i(t)}</p>
      <p class="muted">${i(e)}</p>
    </div>
    <div class="box" style="min-width: 280px;">
      <div class="meta"><strong>Date:</strong> ${i(n??"—")}</div>
      ${a?`<div class="meta"><strong>Due Date:</strong> ${i(a)}</div>`:""}
      ${v.map(t=>`<div class="meta">${i(t)}</div>`).join("")}
    </div>
  </div>

  ${u.length?`<div class="section box"><strong>Billing Address</strong><div class="meta">${u.map(i).join("<br/>")}</div></div>`:""}
  ${o?`<div class="section box">${o}</div>`:""}

  <div class="section">${l}</div>
  ${d?`<div class="section">${d}</div>`:""}

  ${f.length?`<div class="section box"><strong>Bank Details</strong><div class="meta">${f.map(i).join("<br/>")}</div></div>`:""}
  ${r.printTerms?`<div class="section box"><strong>Terms & Conditions</strong><div class="meta">${i(r.printTerms).replaceAll("\n","<br/>")}</div></div>`:""}

  <div class="sig">
    <div class="sig-box">${i(b)}</div>
    <div class="sig-box">${i(g)}</div>
  </div>
  ${r.printFooterNote?`<div class="foot">${i(r.printFooterNote).replaceAll("\n","<br/>")}</div>`:""}
</body>
</html>`}n.d(e,{iF:()=>o,lb:()=>a,p6:()=>r,v_:()=>i})},33360:(t,e,n)=>{n.d(e,{KD:()=>s});var i=n(53524),a=n(92866);let r=globalThis.prisma??new i.PrismaClient({log:["error","warn"]});async function s(t){return await (0,a.n)(t)?r:null}},92866:(t,e,n)=>{n.d(e,{l:()=>r,n:()=>a});var i=n(71615);async function a(t){let e=t?.headers.get("host")??null;if(!e)try{e=(0,i.headers)().get("host")}catch{e="localhost"}return function(t){let e=process.env.DATABASE_URL;if(!e)throw Error("DATABASE_URL is not set in environment variables.");return{slug:"default",host:t,databaseUrl:e,source:"default"}}(e)}async function r(t){let e=await t.company.findFirst({where:{deletedAt:null},select:{id:!0}});if(!e)throw Error("No company found. Seed the database first.");return e.id}}};var e=require("../../../../../webpack-runtime.js");e.C(t);var n=t=>e(e.s=t),i=e.X(0,[8948,1615,5972],()=>n(23480));module.exports=i})();