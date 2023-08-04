function Proxy(a,b){this.className="Proxy",this.data={readonly:!1,enabled:!0,color:"#0055E5",name:"",notes:"",host:"",port:0,isSocks:!1,socks:"",pac:"",type:"manual",cycle:!1,useDns:!0,reloadPAC:!1,bypassFPForPAC:!0,reloadPACInterval:60,configUrl:"",notifOnLoad:!0,notifOnError:!0,patterns:[],ipPatterns:[]},a&&a.data?FPUtil.extend(this.data,a.data):FPUtil.extend(this.data,a),(b||!this.data.id)&&(this.data.id=this.randomId()),this.data.patterns&&this.data.patterns.length&&(this.data.patterns=this.data.patterns.map(function(a){return new ProxyPattern(a)})),this.data.ipPatterns&&this.data.ipPatterns.length&&(this.data.ipPatterns=this.data.ipPatterns.map(function(a){return new ProxyPattern(a)}))}function ProxyPattern(a){this.className="ProxyPattern",this.data={enabled:!0,temp:!1,name:"Untitled pattern",url:"",whitelist:"Inclusive",type:"wildcard",regex:""},a&&a.data?FPUtil.extend(this.data,a.data):FPUtil.extend(this.data,a)}window.FPUtil={extend:function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}},Proxy.prototype={toArray:function(){return[this.data.readonly,this.data.enabled,this.data.color,this.data.name,this.data.notes,this.data.host,this.data.port,this.data.isSocks,this.data.socks,this.data.configUrl]},randomId:function(){for(var a="0123456789",b=8,c="",d=0;b>d;d++){var e=Math.floor(Math.random()*a.length);c+=a.substring(e,e+1)}return c},updatePAC:function(){if(this.data.configUrl){var a=$.ajax({url:this.data.configUrl,async:!1});200==a.status?this.data.pac=a.responseText:(alert(chrome.i18n.getMessage("could_not_load",this.data.configUrl)),this.data.pac="")}else this.data.pac=""}},ProxyPattern.prototype={toArray:function(){return[this.data.enabled,this.data.name,this.data.url,this.data.type,this.data.whitelist,this.data.temp]}},ProxyPattern.prototype.convertWildcardToRegexString=function(){var a=null;if("wildcard"==this.data.type){var b=this.data.url.replace(/([\/\(\)\[\]\.\?])/g,"\\$1");b=b.replace(/\*/g,".*"),a=b}else a=this.data.url;return a},ProxyPattern.prototype.test=function(a){var b=RegExp(this.convertWildcardToRegexString());return b.test(a)};