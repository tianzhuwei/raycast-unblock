import{_ as o,D as l,c as n,l as e,a as t,I as s,a3 as i,o as r}from"./chunks/framework.BBWgT5cc.js";const x=JSON.parse('{"title":"AI","description":"","frontmatter":{},"headers":[],"relativePath":"features/ai/index.md","filePath":"features/ai/index.md","lastUpdated":1716692563000}'),d={name:"features/ai/index.md"},c=i('<h1 id="ai" tabindex="-1">AI <a class="header-anchor" href="#ai" aria-label="Permalink to &quot;AI&quot;">​</a></h1><p>AI features are used to enhance the capabilities of Raycast Unblock. These features are powered by AI models and APIs.</p><p>Raycast Unblock currently supports multiple AI models and APIs. You can see which AI models and APIs are supported by Raycast Unblock in the sidebar.</p><h2 id="configuration" tabindex="-1">Configuration <a class="header-anchor" href="#configuration" aria-label="Permalink to &quot;Configuration&quot;">​</a></h2><p>The configuration for AI features includes the following parameters:</p><ul><li><code>default</code>: The default AI Server to use.</li></ul><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>The <code>default</code> parameter is used to set the default AI service to use. It may be used in other AI-related features, such as Search Emoji with AI Results.</p><p>Moreover, in specific AI services, the <code>default</code> parameter will be used to set the default model to use. Of course, it is <em>optional</em>.</p></div>',7),p=e("code",null,"temperature",-1),h=e("code",null,"max_tokens",-1),u=i(`<div class="tip custom-block"><p class="custom-block-title">TIP</p><p>If the <code>temperature</code> and <code>max_tokens</code> parameters are not set in the specific AI service, this value will be used.</p><p>For example:</p><ul><li>If I don&#39;t set the temperature parameter in <code>AI.OpenAI</code>, this value will be used</li><li>But if I set the temperature parameter in <code>AI.Gemini</code>, the temperature parameter in <code>AI.Gemini</code> will be used</li></ul></div><p>Besides, the <code>temperature</code> and <code>max_tokens</code> parameters can be set in specific AI services to override the global configuration.</p><h3 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to &quot;Example&quot;">​</a></h3><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">default = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;openai&#39;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># temperature = 0.5</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># max_tokens = 100</span></span></code></pre></div>`,4);function m(_,f,k,I,A,b){const a=l("Badge");return r(),n("div",null,[c,e("ul",null,[e("li",null,[p,t(": The temperature of the model. "),s(a,{type:"info",text:"Optional"})]),e("li",null,[h,t(": The maximum tokens of the model. "),s(a,{type:"info",text:"Optional"})])]),u])}const v=o(d,[["render",m]]);export{x as __pageData,v as default};
