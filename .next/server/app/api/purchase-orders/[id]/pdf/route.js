"use strict";(()=>{var t={};t.id=1860,t.ids=[1860],t.modules={53524:t=>{t.exports=require("@prisma/client")},72934:t=>{t.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:t=>{t.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:t=>{t.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},12176:(t,e,n)=>{n.r(e),n.d(e,{originalPathname:()=>x,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>b});var r={};n.r(r),n.d(r,{GET:()=>u,dynamic:()=>p});var a=n(49303),i=n(88716),s=n(60670),o=n(33360),l=n(92866),d=n(31021),c=n(60414);let p="force-dynamic";async function u(t,{params:e}){let n=await (0,o.KD)();if(!n)return(0,d.bg)("Tenant not found",404);let r=await (0,l.l)(n),a=await n.purchaseOrder.findFirst({where:{id:e.id,companyId:r,deletedAt:null},include:{vendor:!0,lines:{include:{sku:!0}},company:!0}});if(!a)return new Response("Purchase order not found",{status:404});let i=a.lines.reduce((t,e)=>{let n=e.discountPct??0;return t+e.quantity*e.unitPrice*(1-n/100)},0),s=a.lines.reduce((t,e)=>{let n=e.discountPct??0,r=e.quantity*e.unitPrice*(1-n/100);return t+(e.taxPct??0)/100*r},0),p=`
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Discount %</th>
          ${a.company.printShowTaxBreakup??!0?'<th class="num">Tax %</th>':""}
          <th class="num">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${a.lines.map(t=>{let e=t.discountPct??0,n=t.taxPct??0,r=t.quantity*t.unitPrice*(1-e/100);return`<tr>
              <td>${(0,c.v_)(`${t.sku.code} \xb7 ${t.sku.name}`)}</td>
              <td>${(0,c.v_)(`${t.quantity} ${t.sku.unit}`)}</td>
              <td class="num">${(0,c.v_)((0,c.lb)(t.unitPrice))}</td>
              <td class="num">${(0,c.v_)(e.toFixed(2))}</td>
              ${a.company.printShowTaxBreakup??!0?`<td class="num">${(0,c.v_)(n.toFixed(2))}</td>`:""}
              <td class="num">${(0,c.v_)((0,c.lb)(r*(1+n/100)))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  `,u=`
    <table class="totals">
      <tbody>
        <tr><td>Sub Total</td><td class="num">${(0,c.v_)((0,c.lb)(i))}</td></tr>
        ${a.company.printShowTaxBreakup??!0?`<tr><td>Total Tax</td><td class="num">${(0,c.v_)((0,c.lb)(s))}</td></tr>`:""}
        <tr><td><strong>PO Total</strong></td><td class="num"><strong>${(0,c.v_)((0,c.lb)(i+s))}</strong></td></tr>
      </tbody>
    </table>
  `,m=`
    <strong>Vendor</strong>
    <div class="meta">${(0,c.v_)(a.vendor.name)}</div>
    <div class="meta">PO Type: ${(0,c.v_)(a.type)}</div>
    <div class="meta">Status: ${(0,c.v_)(a.status)}</div>
  `;return new Response((0,c.iF)({title:"Purchase Order",docNumber:a.poNumber??a.id,docDate:(0,c.p6)(a.orderDate),company:a.company,partyBlock:m,bodyHtml:p,totalsHtml:u}),{headers:{"Content-Type":"text/html"}})}let m=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/purchase-orders/[id]/pdf/route",pathname:"/api/purchase-orders/[id]/pdf",filename:"route",bundlePath:"app/api/purchase-orders/[id]/pdf/route"},resolvedPagePath:"/Users/shaswatsmac/Desktop/SaasProd/SaasProd/src/app/api/purchase-orders/[id]/pdf/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:g,staticGenerationAsyncStorage:b,serverHooks:h}=m,x="/api/purchase-orders/[id]/pdf/route";function f(){return(0,s.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:b})}},31021:(t,e,n)=>{n.d(e,{Yy:()=>s,bg:()=>i,uW:()=>a});var r=n(87070);function a(t,e){return r.NextResponse.json({ok:!0,data:t},e)}function i(t,e=400,n){return r.NextResponse.json({ok:!1,message:t,errors:n},{status:e})}function s(t){return i("Validation failed",400,t.issues.map(t=>({field:t.path.join("."),message:t.message})))}},60414:(t,e,n)=>{function r(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function a(t){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(t??0)}function i(t){if(!t)return"—";let e=t instanceof Date?t:new Date(t);return Number.isNaN(e.getTime())?"—":e.toLocaleDateString("en-IN")}function s(t){return t.map(t=>String(t??"").trim()).filter(Boolean)}function o({title:t,docNumber:e,docDate:n,dueDate:a,company:i,partyBlock:o,bodyHtml:l,totalsHtml:d}){let c=i.printHeaderLine1||i.name,p=i.printHeaderLine2||"",u=s([i.billingLine1,i.billingLine2,i.billingCity,i.billingState,i.billingPostalCode,i.billingCountry]),m=i.printShowCompanyGstin??!0,g=i.printPreparedByLabel||"Prepared By",b=i.printAuthorizedByLabel||"Authorized Signatory",h=s([m&&i.gstin?`GSTIN: ${i.gstin}`:null,i.pan?`PAN: ${i.pan}`:null,i.cin?`CIN: ${i.cin}`:null,i.phone?`Phone: ${i.phone}`:null,i.email?`Email: ${i.email}`:null,i.website?`Web: ${i.website}`:null]),x=s([i.bankName?`Bank: ${i.bankName}`:null,i.bankBranch?`Branch: ${i.bankBranch}`:null,i.bankAccountName?`A/C Name: ${i.bankAccountName}`:null,i.bankAccountNumber?`A/C No: ${i.bankAccountNumber}`:null,i.bankIfsc?`IFSC: ${i.bankIfsc}`:null,i.bankUpiId?`UPI: ${i.bankUpiId}`:null]);return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${r(t)} ${r(e)}</title>
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
      <h2>${r(c)}</h2>
      ${p?`<p class="muted" style="margin-top:4px;">${r(p)}</p>`:""}
      <p class="title">${r(t)}</p>
      <p class="muted">${r(e)}</p>
    </div>
    <div class="box" style="min-width: 280px;">
      <div class="meta"><strong>Date:</strong> ${r(n??"—")}</div>
      ${a?`<div class="meta"><strong>Due Date:</strong> ${r(a)}</div>`:""}
      ${h.map(t=>`<div class="meta">${r(t)}</div>`).join("")}
    </div>
  </div>

  ${u.length?`<div class="section box"><strong>Billing Address</strong><div class="meta">${u.map(r).join("<br/>")}</div></div>`:""}
  ${o?`<div class="section box">${o}</div>`:""}

  <div class="section">${l}</div>
  ${d?`<div class="section">${d}</div>`:""}

  ${x.length?`<div class="section box"><strong>Bank Details</strong><div class="meta">${x.map(r).join("<br/>")}</div></div>`:""}
  ${i.printTerms?`<div class="section box"><strong>Terms & Conditions</strong><div class="meta">${r(i.printTerms).replaceAll("\n","<br/>")}</div></div>`:""}

  <div class="sig">
    <div class="sig-box">${r(g)}</div>
    <div class="sig-box">${r(b)}</div>
  </div>
  ${i.printFooterNote?`<div class="foot">${r(i.printFooterNote).replaceAll("\n","<br/>")}</div>`:""}
</body>
</html>`}n.d(e,{iF:()=>o,lb:()=>a,p6:()=>i,v_:()=>r})},33360:(t,e,n)=>{n.d(e,{KD:()=>s});var r=n(53524),a=n(92866);let i=globalThis.prisma??new r.PrismaClient({log:["error","warn"]});async function s(t){return await (0,a.n)(t)?i:null}},92866:(t,e,n)=>{n.d(e,{l:()=>i,n:()=>a});var r=n(71615);async function a(t){let e=t?.headers.get("host")??null;if(!e)try{e=(0,r.headers)().get("host")}catch{e="localhost"}return function(t){let e=process.env.DATABASE_URL;if(!e)throw Error("DATABASE_URL is not set in environment variables.");return{slug:"default",host:t,databaseUrl:e,source:"default"}}(e)}async function i(t){let e=await t.company.findFirst({where:{deletedAt:null},select:{id:!0}});if(!e)throw Error("No company found. Seed the database first.");return e.id}}};var e=require("../../../../../webpack-runtime.js");e.C(t);var n=t=>e(e.s=t),r=e.X(0,[8948,1615,5972],()=>n(12176));module.exports=r})();