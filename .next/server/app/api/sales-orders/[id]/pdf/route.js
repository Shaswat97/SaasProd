"use strict";(()=>{var t={};t.id=3657,t.ids=[3657],t.modules={53524:t=>{t.exports=require("@prisma/client")},72934:t=>{t.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:t=>{t.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:t=>{t.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},72835:(t,e,n)=>{n.r(e),n.d(e,{originalPathname:()=>f,patchFetch:()=>h,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>x,staticGenerationAsyncStorage:()=>b});var a={};n.r(a),n.d(a,{GET:()=>u,dynamic:()=>p});var i=n(49303),r=n(88716),s=n(60670),o=n(33360),l=n(92866),d=n(31021),c=n(60414);let p="force-dynamic";async function u(t,{params:e}){let n=await (0,o.KD)();if(!n)return(0,d.bg)("Tenant not found",404);let a=await (0,l.l)(n),i=await n.salesOrder.findFirst({where:{id:e.id,companyId:a,deletedAt:null},include:{customer:!0,lines:{include:{sku:!0}},company:!0}});if(!i)return new Response("Sales order not found",{status:404});let r=i.lines.reduce((t,e)=>{let n=e.discountPct??0;return t+e.quantity*e.unitPrice*(1-n/100)},0),s=i.lines.reduce((t,e)=>{let n=e.discountPct??0,a=e.quantity*e.unitPrice*(1-n/100);return t+(e.taxPct??0)/100*a},0),p=`
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Discount %</th>
          ${i.company.printShowTaxBreakup??!0?'<th class="num">Tax %</th>':""}
          <th class="num">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${i.lines.map(t=>{let e=t.discountPct??0,n=t.taxPct??0,a=t.quantity*t.unitPrice*(1-e/100);return`<tr>
              <td>${(0,c.v_)(`${t.sku.code} \xb7 ${t.sku.name}`)}</td>
              <td>${(0,c.v_)(`${t.quantity} ${t.sku.unit}`)}</td>
              <td class="num">${(0,c.v_)((0,c.lb)(t.unitPrice))}</td>
              <td class="num">${(0,c.v_)(e.toFixed(2))}</td>
              ${i.company.printShowTaxBreakup??!0?`<td class="num">${(0,c.v_)(n.toFixed(2))}</td>`:""}
              <td class="num">${(0,c.v_)((0,c.lb)(a*(1+n/100)))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  `,u=`
    <table class="totals">
      <tbody>
        <tr><td>Sub Total</td><td class="num">${(0,c.v_)((0,c.lb)(r))}</td></tr>
        ${i.company.printShowTaxBreakup??!0?`<tr><td>Total Tax</td><td class="num">${(0,c.v_)((0,c.lb)(s))}</td></tr>`:""}
        <tr><td><strong>Order Total</strong></td><td class="num"><strong>${(0,c.v_)((0,c.lb)(r+s))}</strong></td></tr>
      </tbody>
    </table>
  `,m=`
    <strong>Customer</strong>
    <div class="meta">${(0,c.v_)(i.customer.name)}</div>
    <div class="meta">Status: ${(0,c.v_)(i.status)}</div>
    <div class="meta">Currency: ${(0,c.v_)(i.currency)}</div>
  `;return new Response((0,c.iF)({title:"Sales Order",docNumber:i.soNumber??i.id,docDate:(0,c.p6)(i.orderDate),company:i.company,partyBlock:m,bodyHtml:p,totalsHtml:u}),{headers:{"Content-Type":"text/html"}})}let m=new i.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/sales-orders/[id]/pdf/route",pathname:"/api/sales-orders/[id]/pdf",filename:"route",bundlePath:"app/api/sales-orders/[id]/pdf/route"},resolvedPagePath:"/Users/shaswatsmac/Desktop/SaasProd/SaasProd/src/app/api/sales-orders/[id]/pdf/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:g,staticGenerationAsyncStorage:b,serverHooks:x}=m,f="/api/sales-orders/[id]/pdf/route";function h(){return(0,s.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:b})}},31021:(t,e,n)=>{n.d(e,{Yy:()=>s,bg:()=>r,uW:()=>i});var a=n(87070);function i(t,e){return a.NextResponse.json({ok:!0,data:t},e)}function r(t,e=400,n){return a.NextResponse.json({ok:!1,message:t,errors:n},{status:e})}function s(t){return r("Validation failed",400,t.issues.map(t=>({field:t.path.join("."),message:t.message})))}},60414:(t,e,n)=>{function a(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function i(t){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(t??0)}function r(t){if(!t)return"—";let e=t instanceof Date?t:new Date(t);return Number.isNaN(e.getTime())?"—":e.toLocaleDateString("en-IN")}function s(t){return t.map(t=>String(t??"").trim()).filter(Boolean)}function o({title:t,docNumber:e,docDate:n,dueDate:i,company:r,partyBlock:o,bodyHtml:l,totalsHtml:d}){let c=r.printHeaderLine1||r.name,p=r.printHeaderLine2||"",u=s([r.billingLine1,r.billingLine2,r.billingCity,r.billingState,r.billingPostalCode,r.billingCountry]),m=r.printShowCompanyGstin??!0,g=r.printPreparedByLabel||"Prepared By",b=r.printAuthorizedByLabel||"Authorized Signatory",x=s([m&&r.gstin?`GSTIN: ${r.gstin}`:null,r.pan?`PAN: ${r.pan}`:null,r.cin?`CIN: ${r.cin}`:null,r.phone?`Phone: ${r.phone}`:null,r.email?`Email: ${r.email}`:null,r.website?`Web: ${r.website}`:null]),f=s([r.bankName?`Bank: ${r.bankName}`:null,r.bankBranch?`Branch: ${r.bankBranch}`:null,r.bankAccountName?`A/C Name: ${r.bankAccountName}`:null,r.bankAccountNumber?`A/C No: ${r.bankAccountNumber}`:null,r.bankIfsc?`IFSC: ${r.bankIfsc}`:null,r.bankUpiId?`UPI: ${r.bankUpiId}`:null]);return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${a(t)} ${a(e)}</title>
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
      <h2>${a(c)}</h2>
      ${p?`<p class="muted" style="margin-top:4px;">${a(p)}</p>`:""}
      <p class="title">${a(t)}</p>
      <p class="muted">${a(e)}</p>
    </div>
    <div class="box" style="min-width: 280px;">
      <div class="meta"><strong>Date:</strong> ${a(n??"—")}</div>
      ${i?`<div class="meta"><strong>Due Date:</strong> ${a(i)}</div>`:""}
      ${x.map(t=>`<div class="meta">${a(t)}</div>`).join("")}
    </div>
  </div>

  ${u.length?`<div class="section box"><strong>Billing Address</strong><div class="meta">${u.map(a).join("<br/>")}</div></div>`:""}
  ${o?`<div class="section box">${o}</div>`:""}

  <div class="section">${l}</div>
  ${d?`<div class="section">${d}</div>`:""}

  ${f.length?`<div class="section box"><strong>Bank Details</strong><div class="meta">${f.map(a).join("<br/>")}</div></div>`:""}
  ${r.printTerms?`<div class="section box"><strong>Terms & Conditions</strong><div class="meta">${a(r.printTerms).replaceAll("\n","<br/>")}</div></div>`:""}

  <div class="sig">
    <div class="sig-box">${a(g)}</div>
    <div class="sig-box">${a(b)}</div>
  </div>
  ${r.printFooterNote?`<div class="foot">${a(r.printFooterNote).replaceAll("\n","<br/>")}</div>`:""}
</body>
</html>`}n.d(e,{iF:()=>o,lb:()=>i,p6:()=>r,v_:()=>a})},33360:(t,e,n)=>{n.d(e,{KD:()=>s});var a=n(53524),i=n(92866);let r=globalThis.prisma??new a.PrismaClient({log:["error","warn"]});async function s(t){return await (0,i.n)(t)?r:null}},92866:(t,e,n)=>{n.d(e,{l:()=>r,n:()=>i});var a=n(71615);async function i(t){let e=t?.headers.get("host")??null;if(!e)try{e=(0,a.headers)().get("host")}catch{e="localhost"}return function(t){let e=process.env.DATABASE_URL;if(!e)throw Error("DATABASE_URL is not set in environment variables.");return{slug:"default",host:t,databaseUrl:e,source:"default"}}(e)}async function r(t){let e=await t.company.findFirst({where:{deletedAt:null},select:{id:!0}});if(!e)throw Error("No company found. Seed the database first.");return e.id}}};var e=require("../../../../../webpack-runtime.js");e.C(t);var n=t=>e(e.s=t),a=e.X(0,[8948,1615,5972],()=>n(72835));module.exports=a})();