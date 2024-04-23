import{_ as l,D as n,c as o,l as e,a,I as s,a4 as i,o as r}from"./chunks/framework.DCrfWSmk.js";const q=JSON.parse('{"title":"LibreTranslate","description":"","frontmatter":{},"headers":[],"relativePath":"features/translator/libre-translate.md","filePath":"features/translator/libre-translate.md","lastUpdated":1713879980000}'),p={name:"features/translator/libre-translate.md"},c={id:"libretranslate",tabindex:"-1"},d=e("a",{class:"header-anchor",href:"#libretranslate","aria-label":'Permalink to "LibreTranslate <Badge type="tip" text="^0.1.0-beta.8" />"'},"​",-1),h=i('<p>You can use LibreTranslate to translate text in Raycast Translate feature.</p><h2 id="solutions" tabindex="-1">Solutions <a class="header-anchor" href="#solutions" aria-label="Permalink to &quot;Solutions&quot;">​</a></h2><p>We provide two solutions:</p><ol><li><strong>api</strong>: Use the official LibreTranslate API service for translation.</li><li><strong>reserve</strong>: Use the inverted LibreTranslate service for translation.</li></ol><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p><em>Reserve solution</em> is an inverted implementation. Please use with caution.</p></div><h2 id="usage" tabindex="-1">Usage <a class="header-anchor" href="#usage" aria-label="Permalink to &quot;Usage&quot;">​</a></h2><ol><li>Set <code>Translate.default</code> to <code>libretranslate</code> in your configuration file.</li><li>Set <code>Translate.LibreTranslate.type</code> to <code>api</code> or <code>reserve</code> in your configuration file.</li><li>If you choose <code>api</code>, you need to set <code>Translate.LibreTranslate.api_key</code> to your LibreTranslate API key.</li></ol><h2 id="configuration" tabindex="-1">Configuration <a class="header-anchor" href="#configuration" aria-label="Permalink to &quot;Configuration&quot;">​</a></h2>',8),u=e("code",null,"base_url",-1),_=e("code",null,"type",-1),k=e("a",{href:"#solutions"},"Type - Solutions",-1),b=e("code",null,"api_key",-1),f=i(`<h2 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to &quot;Example&quot;">​</a></h2><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Translate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">LibreTranslate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">base_url = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://libretranslate.com&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">type = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;reserve&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">api_key = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;</span></span></code></pre></div>`,2);function g(T,y,E,m,v,x){const t=n("Badge");return r(),o("div",null,[e("h1",c,[a("LibreTranslate "),s(t,{type:"tip",text:"^0.1.0-beta.8"}),a(),d]),h,e("ul",null,[e("li",null,[u,a(": The base URL for LibreTranslate API. "),s(t,{type:"info",text:"Optional"})]),e("li",null,[_,a(": The type of LibreTranslate service. "),k,a(),s(t,{type:"info",text:"Optional"})]),e("li",null,[b,a(": The API key for LibreTranslate API. "),s(t,{type:"info",text:"Optional (Only for reserve solution)"})])]),f])}const C=l(p,[["render",g]]);export{q as __pageData,C as default};
