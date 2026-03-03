"use strict";(()=>{var t={};t.id=1970,t.ids=[1970],t.modules={53524:t=>{t.exports=require("@prisma/client")},72934:t=>{t.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:t=>{t.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:t=>{t.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},41403:(t,e,n)=>{n.r(e),n.d(e,{originalPathname:()=>h,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>b,staticGenerationAsyncStorage:()=>v});var i={};n.r(i),n.d(i,{GET:()=>p,dynamic:()=>u});var a=n(49303),s=n(88716),r=n(60670),o=n(33360),l=n(92866),d=n(31021),c=n(60414);let u="force-dynamic";async function p(t,{params:e}){let n=await (0,o.KD)();if(!n)return(0,d.bg)("Tenant not found",404);let i=await (0,l.l)(n),{searchParams:a}=new URL(t.url),s=!["0","false","no"].includes((a.get("includePackaging")??"").toLowerCase()),r=await n.salesInvoice.findFirst({where:{id:e.id,companyId:i},include:{salesOrder:{include:{customer:!0}},lines:{include:{sku:!0}},delivery:!0,company:!0}});if(!r)return new Response("Invoice not found",{status:404});let u=await n.salesOrder.findFirst({where:{id:r.salesOrderId,companyId:i},include:{lines:{include:{sku:!0}},invoices:{include:{lines:!0}}}}),p=r.lines.reduce((t,e)=>{let n=e.discountPct??0,i=e.taxPct??0,a=e.unitPrice*(1-n/100);return t+e.quantity*a*(1+i/100)},0),m=s?r.delivery?.packagingCost??0:0,g=r.lines.reduce((t,e)=>{let n=e.discountPct??0,i=e.unitPrice*(1-n/100);return t+e.quantity*i},0),v=r.company.printShowTaxBreakup??!0,b=`
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Discount %</th>
          ${v?'<th class="num">Tax %</th>':""}
          <th class="num">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${r.lines.map(t=>{let e=t.discountPct??0,n=t.taxPct??0,i=t.unitPrice*(1-e/100),a=t.quantity*i*(1+n/100);return`<tr>
              <td>${(0,c.v_)(`${t.sku.code} \xb7 ${t.sku.name}`)}</td>
              <td>${(0,c.v_)(`${t.quantity} ${t.sku.unit}`)}</td>
              <td class="num">${(0,c.v_)((0,c.lb)(t.unitPrice))}</td>
              <td class="num">${(0,c.v_)(e.toFixed(2))}</td>
              ${v?`<td class="num">${(0,c.v_)(n.toFixed(2))}</td>`:""}
              <td class="num">${(0,c.v_)((0,c.lb)(a))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  `,h=`
    <table class="totals">
      <tbody>
        <tr><td>Sub Total</td><td class="num">${(0,c.v_)((0,c.lb)(g))}</td></tr>
        ${v?`<tr><td>Total Tax</td><td class="num">${(0,c.v_)((0,c.lb)(p-g))}</td></tr>`:""}
        ${m>0?`<tr><td>Packaging / Logistics</td><td class="num">${(0,c.v_)((0,c.lb)(m))}</td></tr>`:""}
        <tr><td><strong>Grand Total</strong></td><td class="num"><strong>${(0,c.v_)((0,c.lb)(p+m))}</strong></td></tr>
      </tbody>
    </table>
  `,f="";if(u){let t=new Map;for(let e of u.invoices)for(let n of e.lines)t.set(n.soLineId,(t.get(n.soLineId)??0)+n.quantity);let e=u.lines.map(e=>{let n=t.get(e.id)??0,i=Math.max(e.quantity-n,0);return{line:e,totalInvoiced:n,remaining:i}}).filter(t=>t.remaining>0);e.length>0&&(f=`
        <div class="section" style="margin-top:24px; padding-top:16px; border-top:2px dashed #ddd2f5;">
          <p style="font-size:13px; font-weight:700; margin-bottom:4px; color:#5a4f70;">
            Balance of Order &mdash; Pending Deliveries
          </p>
          <p style="font-size:11px; color:#6b637d; margin-bottom:8px;">
            This is a <strong>partial invoice</strong>. The quantities below remain to be delivered 
            and will be invoiced in subsequent shipments.
          </p>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th class="num">Total Ordered</th>
                <th class="num">Invoiced To Date</th>
                <th class="num" style="color:#c07000;">Pending Qty</th>
                <th class="num">Unit</th>
              </tr>
            </thead>
            <tbody>
              ${e.map(({line:t,totalInvoiced:e,remaining:n})=>`
                <tr>
                  <td>${(0,c.v_)(`${t.sku.code} \xb7 ${t.sku.name}`)}</td>
                  <td class="num">${(0,c.v_)(String(t.quantity))}</td>
                  <td class="num">${(0,c.v_)(String(e))}</td>
                  <td class="num" style="font-weight:600; color:#c07000;">${(0,c.v_)(String(n))}</td>
                  <td class="num">${(0,c.v_)(t.sku.unit)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`)}let x=`
    <strong>Bill To</strong>
    <div class="meta">${(0,c.v_)(r.salesOrder.customer.name)}</div>
    <div class="meta">Sales Order: ${(0,c.v_)(r.salesOrder.soNumber??"—")}</div>
    ${r.dueDate?`<div class="meta">Payment Due: ${(0,c.v_)((0,c.p6)(r.dueDate))}</div>`:""}
  `;return new Response((0,c.iF)({title:"Tax Invoice",docNumber:r.invoiceNumber??r.id,docDate:(0,c.p6)(r.invoiceDate),dueDate:r.dueDate?(0,c.p6)(r.dueDate):void 0,company:r.company,partyBlock:x,bodyHtml:b+f,totalsHtml:h}),{headers:{"Content-Type":"text/html"}})}let m=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/sales-orders/invoices/[id]/pdf/route",pathname:"/api/sales-orders/invoices/[id]/pdf",filename:"route",bundlePath:"app/api/sales-orders/invoices/[id]/pdf/route"},resolvedPagePath:"/Users/shaswatsmac/Desktop/SaasProd/SaasProd/src/app/api/sales-orders/invoices/[id]/pdf/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:v,serverHooks:b}=m,h="/api/sales-orders/invoices/[id]/pdf/route";function f(){return(0,r.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:v})}},31021:(t,e,n)=>{n.d(e,{Yy:()=>r,bg:()=>s,uW:()=>a});var i=n(87070);function a(t,e){return i.NextResponse.json({ok:!0,data:t},e)}function s(t,e=400,n){return i.NextResponse.json({ok:!1,message:t,errors:n},{status:e})}function r(t){return s("Validation failed",400,t.issues.map(t=>({field:t.path.join("."),message:t.message})))}},60414:(t,e,n)=>{function i(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function a(t){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(t??0)}function s(t){if(!t)return"—";let e=t instanceof Date?t:new Date(t);return Number.isNaN(e.getTime())?"—":e.toLocaleDateString("en-IN")}function r(t){return t.map(t=>String(t??"").trim()).filter(Boolean)}function o({title:t,docNumber:e,docDate:n,dueDate:a,company:s,partyBlock:o,bodyHtml:l,totalsHtml:d}){let c=s.printHeaderLine1||s.name,u=s.printHeaderLine2||"",p=r([s.billingLine1,s.billingLine2,s.billingCity,s.billingState,s.billingPostalCode,s.billingCountry]),m=s.printShowCompanyGstin??!0,g=s.printPreparedByLabel||"Prepared By",v=s.printAuthorizedByLabel||"Authorized Signatory",b=r([m&&s.gstin?`GSTIN: ${s.gstin}`:null,s.pan?`PAN: ${s.pan}`:null,s.cin?`CIN: ${s.cin}`:null,s.phone?`Phone: ${s.phone}`:null,s.email?`Email: ${s.email}`:null,s.website?`Web: ${s.website}`:null]),h=r([s.bankName?`Bank: ${s.bankName}`:null,s.bankBranch?`Branch: ${s.bankBranch}`:null,s.bankAccountName?`A/C Name: ${s.bankAccountName}`:null,s.bankAccountNumber?`A/C No: ${s.bankAccountNumber}`:null,s.bankIfsc?`IFSC: ${s.bankIfsc}`:null,s.bankUpiId?`UPI: ${s.bankUpiId}`:null]);return`<!doctype html>
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
      <h2>${i(c)}</h2>
      ${u?`<p class="muted" style="margin-top:4px;">${i(u)}</p>`:""}
      <p class="title">${i(t)}</p>
      <p class="muted">${i(e)}</p>
    </div>
    <div class="box" style="min-width: 280px;">
      <div class="meta"><strong>Date:</strong> ${i(n??"—")}</div>
      ${a?`<div class="meta"><strong>Due Date:</strong> ${i(a)}</div>`:""}
      ${b.map(t=>`<div class="meta">${i(t)}</div>`).join("")}
    </div>
  </div>

  ${p.length?`<div class="section box"><strong>Billing Address</strong><div class="meta">${p.map(i).join("<br/>")}</div></div>`:""}
  ${o?`<div class="section box">${o}</div>`:""}

  <div class="section">${l}</div>
  ${d?`<div class="section">${d}</div>`:""}

  ${h.length?`<div class="section box"><strong>Bank Details</strong><div class="meta">${h.map(i).join("<br/>")}</div></div>`:""}
  ${s.printTerms?`<div class="section box"><strong>Terms & Conditions</strong><div class="meta">${i(s.printTerms).replaceAll("\n","<br/>")}</div></div>`:""}

  <div class="sig">
    <div class="sig-box">${i(g)}</div>
    <div class="sig-box">${i(v)}</div>
  </div>
  ${s.printFooterNote?`<div class="foot">${i(s.printFooterNote).replaceAll("\n","<br/>")}</div>`:""}
</body>
</html>`}n.d(e,{iF:()=>o,lb:()=>a,p6:()=>s,v_:()=>i})},33360:(t,e,n)=>{n.d(e,{KD:()=>r});var i=n(53524),a=n(92866);let s=globalThis.prisma??new i.PrismaClient({log:["error","warn"]});async function r(t){return await (0,a.n)(t)?s:null}},92866:(t,e,n)=>{n.d(e,{l:()=>s,n:()=>a});var i=n(71615);async function a(t){let e=t?.headers.get("host")??null;if(!e)try{e=(0,i.headers)().get("host")}catch{e="localhost"}return function(t){let e=process.env.DATABASE_URL;if(!e)throw Error("DATABASE_URL is not set in environment variables.");return{slug:"default",host:t,databaseUrl:e,source:"default"}}(e)}async function s(t){let e=await t.company.findFirst({where:{deletedAt:null},select:{id:!0}});if(!e)throw Error("No company found. Seed the database first.");return e.id}}};var e=require("../../../../../../webpack-runtime.js");e.C(t);var n=t=>e(e.s=t),i=e.X(0,[8948,1615,5972],()=>n(41403));module.exports=i})();