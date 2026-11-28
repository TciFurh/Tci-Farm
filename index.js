const _0x140f9c=_0x46fe;(function(_0x866b71,_0x4c11d7){const _0x3fdfc9=_0x46fe,_0x22db1c=_0x866b71();while(!![]){try{const _0x217b72=parseInt("3440mDfMZC")/0x1*(parseInt("212uSpFXe")/0x2)+parseInt("89751mhhShB")/0x3*(parseInt("132uytlEC")/0x4)+parseInt("5VsioXd")/0x5*(-parseInt("2591286OdLIBJ")/0x6)+parseInt("4501308VlLwal")/0x7+-parseInt("5058400bNnHvx")/0x8+parseInt("3448899tJXKPp")/0x9+-parseInt("7806070DLFNAC")/0xa*(parseInt("11jdNYeU")/0xb);if(_0x217b72===_0x4c11d7)break;else _0x22db1c['push'](_0x22db1c['shift']());}catch(_0x2b20dd){_0x22db1c['push'](_0x22db1c['shift']());}}}(_0x4bfe,0x82378));import{JiuLiPlugin,segment}from'../../lib/index.js';function _0x4bfe(){const _0x4f35b5=['·\x20农场：','89751mhhShB','3448899tJXKPp','·\x20指定农场：#农场设置\x202\x205\x20关','2591286OdLIBJ','replace','farm/help','\x20个农场','^#?农场概览','getBindings','二维码已过期，请重新\x20#农场登录\x20微信','accounts.remove','getFarmData','5058400bNnHvx','forEach','【设置成功】','·\x20账号已保存，但启动失败（code\x20可能已过期）','png','applySetting','·\x20开关：#农场设置\x205\x20关','trim','^#?农场背包','getSettingsData','from','watchWx','status','concat','^#?农场设置','^#?农场账号','exec','已取消扫码','」并停止挂机','uid','render','用法：','sender','没有第\x20','login.wxConfirm','taskId','用法：#农场设置\x20编号\x20值','【农场精简版】','accounts.list','bagCmd','test','【二维码生成失败】','split','join','mine','【登录失败】','defaultId','name','farm/bag','^#?农场登录(?:\s*(?:输码|code|微信|wx|wechat)(?:\s.*)?|\s*\d{5,12})?$','card','」（账号仍在引擎里保留；要删号发\x20#农场账号\x20删除\x20','图片渲染失败：请检查\x20resources/farm\x20下的模板与主题文件','ping','[Tci-Farm]\x20引擎启动失败：','·\x20已开始挂机','loginCmd','authorized','7806070DLFNAC','」设为默认农场','^#?我的农场','【我的农场】','platform','log','·\x20账号：','11jdNYeU','base64','map','\x0a微信扫码登录农场，扫完后自动建号并开始挂机（2\x20分钟内有效）','message','filter','started','\x20·\x20','你还没有绑定农场\x0a·\x20QQ：#农场登录\x20输码\x20<code>\x0a·\x20微信：#农场登录\x20微信','·\x20切换查看：#我的农场\x202','timer','farm/settings','length','getBagData','扫码超时，请重新\x20#农场登录\x20微信','bind','·\x20已即时生效','【登录成功】','已解绑「','userAccounts','some','running','call','push','loginCode','·\x20QQ：#农场登录\x20输码\x20<code>','已把「','__tciFarmBoot','help','212uSpFXe','[Tci-Farm]\x20引擎已就绪','overviewCmd','login.wxPoll','3440mDfMZC','你只绑定了\x20','has','valueText','waiting','4501308VlLwal','code\x20太短或格式不对：请发\x20#农场登录\x20输码\x20<完整code>','自带引擎的农场助手：概览/地块/背包/设置/登录','（默认）','·\x20账号已保存，启动失败请重试\x20#农场登录\x20微信','settingsCmd','·\x20注意：code\x20会过期，掉线后重新\x20#农场登录\x20输码\x20<新code>\x20即可','nickname','error','【登录确认失败】','reply','【扫码中断】','#农场账号\x20/\x20#农场概览\x20/\x20#我的农场\x20/\x20#农场背包\x20/\x20#农场设置','function','132uytlEC','qrBase64','#农场登录\x20输码\x20<code>\x20/\x20#农场登录\x20微信','expired','find','【读取失败】','accounts','catch','pickAccount','ensureHealthy','5VsioXd','then','unref','【微信登录成功】','loginWx','accountCmd','·\x20数值：#农场设置\x2024\x2045','已删除「','login.code','prune','user_id','farm/farm','unbind','msg','slice','你还没有绑定农场：\x0a·\x20QQ：#农场登录\x20输码\x20<code>\x0a·\x20微信：#农场登录\x20微信','cancelled','\x20个农场，没有第\x20','·\x20已开始挂机，自动化按设置执行'];_0x4bfe=function(){return _0x4f35b5;};return _0x4bfe();}import*as _0x565d77 from'./model/engine.js';import*as _0x5db0af from'./model/bindings.js';import*as _0x5db46f from'./model/panels.js';import*as _0x3f127c from'./model/settings.js';const sleep=_0x3541c0=>new Promise(_0x40c40b=>setTimeout(_0x40c40b,_0x3541c0));function _0x46fe(_0x5191c7,_0x59fc43){_0x5191c7=_0x5191c7-0x1b4;const _0x4bfea5=_0x4bfe();let _0x46fed3=_0x4bfea5[_0x5191c7];return _0x46fed3;}export default class TciFarm extends JiuLiPlugin{constructor(){const _0x1ab0b3=_0x46fe;super({'name':'Tci-Farm','dsc':"自带引擎的农场助手：概览/地块/背包/设置/登录",'event':'message','priority':0x1e0,'rule':[{'reg':'^#?农场帮助','fnc':"help"},{'reg':"^#?农场登录(?:\\s*(?:输码|code|微信|wx|wechat)(?:\\s.*)?|\\s*\\d{5,12})?$",'fnc':"loginCmd"},{'reg':"^#?农场账号",'fnc':"accountCmd"},{'reg':"^#?农场概览",'fnc':"overviewCmd"},{'reg':"^#?我的农场",'fnc':'farmCmd'},{'reg':"^#?农场背包",'fnc':"bagCmd"},{'reg':"^#?农场设置",'fnc':"settingsCmd"}]});const _0x2d74fa=globalThis['__tciFarmBoot']||(globalThis["__tciFarmBoot"]={});if(_0x2d74fa["timer"])clearInterval(_0x2d74fa["timer"]);setTimeout(()=>{const _0x32f07d=_0x1ab0b3;_0x565d77["call"]("ping")["then"](()=>console["log"]("[Tci-Farm] 引擎已就绪"))["catch"](_0x1b733d=>console["error"]("[Tci-Farm] 引擎启动失败："+_0x1b733d["message"]));},0x4b0),_autoBoot(_0x2d74fa),_0x2d74fa["timer"]=setInterval(()=>{const _0x3549d2=_0x1ab0b3;_0x565d77["ensureHealthy"]()["catch"](()=>{});},0xa*0x3c*0x3e8),_0x2d74fa["timer"]["unref"]?.();}async["render"](_0x3f80c6,_0xc389cc={},_0x432c52={}){const _0x3e1b94=_0x140f9c;return super["render"](_0x3f80c6,{..._0xc389cc,'imgType':"png"},{..._0x432c52,'imgType':"png"});}['uid'](_0x2bf887){const _0x118845=_0x140f9c;return String(_0x2bf887?.["user_id"]||_0x2bf887?.['sender']?.["user_id"]||_0x2bf887?.["sender"]?.['qq']||'');}async["reply"](_0x18e07b,_0x4a6de1){const _0x404a81=_0x140f9c;try{if(typeof _0x18e07b?.["reply"]==="function")return _0x18e07b["reply"](_0x4a6de1);return![];}catch{return![];}}async["userAccounts"](_0x217e26){const _0x2274ca=_0x140f9c,{accounts:_0x57d846}=await _0x565d77["call"]("accounts.list"),_0x18ba6e=new Set(_0x57d846["map"](_0x1d470d=>String(_0x1d470d['id'])));_0x5db0af["prune"]([..._0x18ba6e]);const _0x66bf4f=_0x5db0af["getBindings"](this['uid'](_0x217e26)),_0x533ad2=_0x66bf4f["accounts"]['filter'](_0x8ff40d=>_0x18ba6e["has"](_0x8ff40d));return{'all':_0x57d846,'mine':_0x533ad2["map"](_0x5ab188=>_0x57d846["find"](_0x1c4cf9=>String(_0x1c4cf9['id'])===_0x5ab188))["filter"](Boolean),'defaultId':_0x66bf4f["defaultId"]};}async["pickAccount"](_0x15d2ef,_0x112e15){const _0x1bec2e=_0x140f9c,{mine:_0x3e3ffe,defaultId:_0x59c253}=await this["userAccounts"](_0x15d2ef);if(!_0x3e3ffe['length'])throw new Error("你还没有绑定农场\n· QQ：#农场登录 输码 <code>\n· 微信：#农场登录 微信");const _0x1a7746=String(_0x112e15||'')["trim"](),_0x1f3bb7=/^(\d{1,3})(?:\s+|$)/["exec"](_0x1a7746);let _0xb222eb=0x0,_0x1547a3=_0x1a7746;if(_0x1f3bb7){_0xb222eb=Number(_0x1f3bb7[0x1])-0x1,_0x1547a3=_0x1a7746["slice"](_0x1f3bb7[0x0]["length"])["trim"]();if(!_0x3e3ffe[_0xb222eb])throw new Error("你只绑定了 "["concat"](_0x3e3ffe["length"]," 个农场，没有第 ")["concat"](_0x1f3bb7[0x1],'\x20个'));}else _0x59c253&&_0x3e3ffe["some"](_0x24a911=>String(_0x24a911['id'])===String(_0x59c253))&&(_0xb222eb=_0x3e3ffe['findIndex'](_0x119918=>String(_0x119918['id'])===String(_0x59c253)));return{'account':_0x3e3ffe[_0xb222eb],'list':_0x3e3ffe,'rest':_0x1547a3,'index':_0xb222eb};}async["card"](_0x4d95fa,_0x32fe8e,_0x12bafb,_0x5eebc8){const _0x5caa6a=_0x140f9c;try{const _0x44807f=await _0x12bafb(_0x5eebc8),_0x57eceb=await this["render"](_0x32fe8e,_0x44807f);if(!_0x57eceb)return this["reply"](_0x4d95fa,"图片渲染失败：请检查 resources/farm 下的模板与主题文件");return this["reply"](_0x4d95fa,_0x57eceb);}catch(_0xe24987){return this["reply"](_0x4d95fa,'【读取失败】'['concat'](_0xe24987["message"]));}}async["help"](_0x2f8ded){const _0x3e79ed=_0x140f9c,_0x1531de=await this['render']("farm/help",{});if(!_0x1531de)return this["reply"](_0x2f8ded,["【农场精简版】","#农场登录 输码 <code> / #农场登录 微信","#农场账号 / #农场概览 / #我的农场 / #农场背包 / #农场设置"]["join"]('\x0a'));return this["reply"](_0x2f8ded,_0x1531de);}async["loginCmd"](_0x1dd91b){const _0x1e7c96=_0x140f9c,_0x55ba05=String(_0x1dd91b["msg"]||'')['replace'](/^#?农场登录\s*/,'')["trim"]();if(/^\d{5,12}$/["test"](_0x55ba05))return loginByPacket(this,_0x1dd91b,_0x55ba05);if(/^(微信|wx|wechat)$/i["test"](_0x55ba05))return this['loginWx'](_0x1dd91b);const _0x1a3c48=/^(?:输码|code)\s+([\w-]{8,})$/['exec'](_0x55ba05);if(_0x1a3c48)return this["loginCode"](_0x1dd91b,_0x1a3c48[0x1]);if(!_0x55ba05)return this["reply"](_0x1dd91b,["用法：","· QQ：#农场登录 输码 <code>",'·\x20微信：#农场登录\x20微信（扫码后自动建号）','·\x20同名账号会自动更新\x20code\x20并重启挂机','·\x20本机账号：#农场登录\x20<QQ号>（仅主人）']["join"]('\x0a'));return this["reply"](_0x1dd91b,"code 太短或格式不对：请发 #农场登录 输码 <完整code>");}async['loginCode'](_0x1f9d7d,_0x5d7bf7){const _0x367b89=_0x140f9c;await this["reply"](_0x1f9d7d,'正在登录并启动挂机…（code\x20有有效期，过期需重新输码）');try{const {mine:_0x12339b}=await this["userAccounts"](_0x1f9d7d)["catch"](()=>({'mine':[]})),_0x130c33=_0x12339b["length"]?_0x12339b[0x0]['name']:'农场'["concat"](_0x5d7bf7["slice"](-0x6)),_0x6c208a=await _0x565d77["call"]("login.code",{'name':_0x130c33,'code':_0x5d7bf7,'platform':'qq'});return _0x5db0af["bind"](this["uid"](_0x1f9d7d),_0x6c208a['id']),this["reply"](_0x1f9d7d,["【登录成功】","· 账号："["concat"](_0x6c208a["name"],'（#')["concat"](_0x6c208a['id'],'）'),_0x6c208a["started"]?"· 已开始挂机，自动化按设置执行":"· 账号已保存，但启动失败（code 可能已过期）","· 注意：code 会过期，掉线后重新 #农场登录 输码 <新code> 即可",'·\x20#农场概览\x20看状态\x20·\x20#农场设置\x20改配置']["join"]('\x0a'));}catch(_0x26d06a){return this["reply"](_0x1f9d7d,"【登录失败】"["concat"](_0x26d06a["message"]));}}async["loginWx"](_0x156dec){const _0x509f8d=_0x140f9c;try{const _0x493d6b=await _0x565d77["call"]('login.wxStart',{},0xea60);await this["reply"](_0x156dec,[segment['image'](Buffer["from"](_0x493d6b["qrBase64"],"base64")),"\n微信扫码登录农场，扫完后自动建号并开始挂机（2 分钟内有效）"]),this['watchWx'](_0x156dec,_0x493d6b["taskId"]);}catch(_0x28c1e9){return this["reply"](_0x156dec,"【二维码生成失败】"["concat"](_0x28c1e9["message"]));}}async["watchWx"](_0x5ac1e1,_0x3f9a41){const _0x344244=_0x140f9c,_0x2310e4=this["uid"](_0x5ac1e1);for(let _0x270460=0x0;_0x270460<0x3c;_0x270460++){await sleep(0x7d0);let _0x5acb67;try{_0x5acb67=await _0x565d77["call"]("login.wxPoll",{'taskId':_0x3f9a41});}catch(_0x4d8bb8){return this["reply"](_0x5ac1e1,"【扫码中断】"["concat"](_0x4d8bb8["message"]));}if(_0x5acb67["status"]==="waiting"||_0x5acb67["status"]==='scanned')continue;if(_0x5acb67["status"]==="authorized")try{const _0x241689=await _0x565d77["call"]("login.wxConfirm",{'taskId':_0x3f9a41},0x15f90);return _0x5db0af["bind"](_0x2310e4,_0x241689['id']),this["reply"](_0x5ac1e1,["【微信登录成功】","· 账号："["concat"](_0x241689["name"])["concat"](_0x241689["nickname"]?'（'["concat"](_0x241689['nickname'],'）'):'','（#')["concat"](_0x241689['id'],'）'),_0x241689["started"]?"· 已开始挂机":"· 账号已保存，启动失败请重试 #农场登录 微信"]["join"]('\x0a'));}catch(_0x104e68){return this["reply"](_0x5ac1e1,"【登录确认失败】"['concat'](_0x104e68['message']));}if(_0x5acb67['status']==="expired")return this['reply'](_0x5ac1e1,"二维码已过期，请重新 #农场登录 微信");if(_0x5acb67["status"]==="cancelled")return this['reply'](_0x5ac1e1,"已取消扫码");}return this['reply'](_0x5ac1e1,"扫码超时，请重新 #农场登录 微信");}async["accountCmd"](_0xc49a8b){const _0x4f6093=_0x140f9c,_0x3995b7=String(_0xc49a8b['msg']||'')["replace"](/^#?农场账号\s*/,'')["trim"]();let _0x44a0c3;try{_0x44a0c3=await this["userAccounts"](_0xc49a8b);}catch(_0x398dc1){return this["reply"](_0xc49a8b,"【读取失败】"["concat"](_0x398dc1["message"]));}const _0x4fc917=/^默认\s*(\d{1,3})$/["exec"](_0x3995b7);if(_0x4fc917){const _0x3c3af0=_0x44a0c3['mine'][Number(_0x4fc917[0x1])-0x1];if(!_0x3c3af0)return this["reply"](_0xc49a8b,"没有第 "['concat'](_0x4fc917[0x1],'\x20个农场'));return _0x5db0af['setDefault'](this["uid"](_0xc49a8b),_0x3c3af0['id']),this["reply"](_0xc49a8b,"已把「"["concat"](_0x3c3af0["name"],"」设为默认农场"));}const _0x510b2e=/^解绑\s*(\d{1,3})$/["exec"](_0x3995b7);if(_0x510b2e){const _0x1a2461=_0x44a0c3["mine"][Number(_0x510b2e[0x1])-0x1];if(!_0x1a2461)return this["reply"](_0xc49a8b,"没有第 "["concat"](_0x510b2e[0x1]," 个农场"));return _0x5db0af["unbind"](this['uid'](_0xc49a8b),_0x1a2461['id']),this["reply"](_0xc49a8b,"已解绑「"['concat'](_0x1a2461["name"],"」（账号仍在引擎里保留；要删号发 #农场账号 删除 ")['concat'](_0x510b2e[0x1],'）'));}const _0x4a711e=/^删除\s*(\d{1,3})$/["exec"](_0x3995b7);if(_0x4a711e){const _0x5a97fe=_0x44a0c3["mine"][Number(_0x4a711e[0x1])-0x1];if(!_0x5a97fe)return this["reply"](_0xc49a8b,"没有第 "['concat'](_0x4a711e[0x1]," 个农场"));return await _0x565d77['call']("accounts.remove",{'id':_0x5a97fe['id']}),_0x5db0af["unbind"](this["uid"](_0xc49a8b),_0x5a97fe['id']),this["reply"](_0xc49a8b,"已删除「"["concat"](_0x5a97fe["name"],"」并停止挂机"));}if(!_0x44a0c3["mine"]["length"])return this["reply"](_0xc49a8b,"你还没有绑定农场：\n· QQ：#农场登录 输码 <code>\n· 微信：#农场登录 微信");const _0x280784=["【我的农场】"];return _0x44a0c3["mine"]["forEach"]((_0x1c2a0e,_0x421f92)=>{const _0x1fd93a=_0x4f6093,_0x5bc13d=String(_0x1c2a0e['id'])===String(_0x44a0c3["defaultId"])?"（默认）":'',_0x530db8=_0x1c2a0e["running"]?'在线':'离线',_0x4a29f2=_0x1c2a0e["status"]?.["nickname"]?" · "["concat"](_0x1c2a0e["status"]["nickname"]):'';_0x280784["push"](''["concat"](_0x421f92+0x1,'.\x20')["concat"](_0x1c2a0e["name"])["concat"](_0x5bc13d,'\x20·\x20')["concat"](_0x1c2a0e["platform"]==='wx'?'微信':'QQ','\x20·\x20')["concat"](_0x530db8)['concat'](_0x4a29f2));}),_0x280784["push"]("· 切换查看：#我的农场 2"),_0x280784["push"]('·\x20管理：#农场账号\x20默认\x202\x20/\x20解绑\x202\x20/\x20删除\x202'),this["reply"](_0xc49a8b,_0x280784["join"]('\x0a'));}async["overviewCmd"](_0x246303){const _0x2145c7=_0x140f9c;try{const {account:_0x4bf4f3}=await this['pickAccount'](_0x246303,(_0x246303["msg"]||'')["replace"](/^#?农场概览\s*/,''));return this["card"](_0x246303,'farm/overview',_0x5db46f['getOverviewData'],_0x4bf4f3);}catch(_0x5825ec){return this["reply"](_0x246303,_0x5825ec["message"]);}}async['farmCmd'](_0x59401c){const _0x37f9ec=_0x140f9c;try{const {account:_0x32e684}=await this["pickAccount"](_0x59401c,(_0x59401c["msg"]||'')["replace"](/^#?我的农场\s*/,''));return this["card"](_0x59401c,"farm/farm",_0x5db46f["getFarmData"],_0x32e684);}catch(_0x327601){return this["reply"](_0x59401c,_0x327601["message"]);}}async["bagCmd"](_0x4a4c0e){const _0x585b=_0x140f9c;try{const {account:_0x4a7975}=await this["pickAccount"](_0x4a4c0e,(_0x4a4c0e["msg"]||'')['replace'](/^#?农场背包\s*/,''));return this["card"](_0x4a4c0e,"farm/bag",_0x5db46f["getBagData"],_0x4a7975);}catch(_0x250410){return this["reply"](_0x4a4c0e,_0x250410['message']);}}async["settingsCmd"](_e){
const _txt=String(_e["msg"]||"").replace(/^#?农场设置\s*/,"").trim();
try{
const {mine:_mine,defaultId:_def}=await this["userAccounts"](_e);
if(!_mine.length)return this["reply"](_e,"你还没有绑定农场：\n· QQ：#农场登录 输码 <code>\n· 微信：#农场登录 微信");
let _di=0;
if(_def){const _k=_mine.findIndex(_a=>String(_a["id"])===String(_def));if(_k>=0)_di=_k;}
const _t=_txt?_txt.split(/\s+/).filter(Boolean):[];
if(!_t.length)return this["card"](_e,"farm/settings",_0x5db46f["getSettingsData"],_mine[_di]);
const _n=/^\d{1,3}$/.test(_t[0])?Number(_t[0]):0;
const _rest=_t.slice(1);
let _r=null,_errA=null;
if(_n>0&&_rest.length){
const _f=_mine[_n-1];
if(_f){
try{
_r=await _0x3f127c["applySetting"](_f["id"],_rest[0],_rest.slice(1).join(" "));
return this["reply"](_e,["【设置成功】","· 农场："+_f["name"],"· "+_r["no"]+". "+_r["name"]+"："+_r["valueText"],"· 已即时生效"].join("\n"));
}catch(_x){_errA=_x;}
}else{_errA=new Error("你只绑定了 "+_mine.length+" 个农场，没有第 "+_n+" 个");}
}
if(_n>0&&!_rest.length){
if(_mine[_n-1])return this["card"](_e,"farm/settings",_0x5db46f["getSettingsData"],_mine[_n-1]);
return this["reply"](_e,"【设置失败】你只绑定了 "+_mine.length+" 个农场，没有第 "+_n+" 个");
}
if(_rest.length){
try{
const _a=_mine[_di];
_r=await _0x3f127c["applySetting"](_a["id"],_t[0],_rest.join(" "));
return this["reply"](_e,["【设置成功】","· 农场："+_a["name"],"· "+_r["no"]+". "+_r["name"]+"："+_r["valueText"],"· 已即时生效"].join("\n"));
}catch(_y){
if(_errA&&_errA.message.indexOf("没有第")<0)throw _errA;
throw _y;
}
}
return this["reply"](_e,["用法：#农场设置 编号 值","· 开关：#农场设置 自动务农 关","· 数值：#农场设置 农场巡查最小 20","· 带农场序号：#农场设置 2 5 关","· 查看编号：#农场设置"].join("\n"));
}catch(_z){return this["reply"](_e,"【设置失败】"+_z["message"]);}
}
}
/* ---- 本机账号自动取码（仅主人） ---- */
function _pbv(n){const a=[];let v=n>>>0;while(v>127){a.push((v&127)|128);v>>>=7}a.push(v);return a}
function _pbtag(f,w){return _pbv(f*8+w)}
function _pbint(f,v){return [..._pbtag(f,0),..._pbv(v)]}
function _pbbytes(f,buf){return [..._pbtag(f,2),..._pbv(buf.length),...buf]}
function _pbstr(f,str){return _pbbytes(f,Buffer.from(str,'utf8'))}
function _pbread(buf,pos){let v=0,sh=0,b;do{b=buf[pos++];v+=(b&127)*2**sh;sh+=7}while(b&128&&pos<buf.length);return [v,pos]}
function _pbfields(buf){const out={};let pos=0;while(pos<buf.length){const t=_pbread(buf,pos),tag=t[0];pos=t[1];const f=Math.floor(tag/8),w=tag%8
if(w===0){const r=_pbread(buf,pos);pos=r[1];(out[f]||=[]).push(r[0])}
else if(w===2){const r=_pbread(buf,pos);pos=r[1];(out[f]||=[]).push(buf.subarray(pos,pos+r[0]));pos+=r[0]}
else if(w===5)pos+=4;else if(w===1)pos+=8;else break}return out}
function _farmBody(onebot){
  const sub=_pbstr(1,'1112386029')
  return onebot
    ? Buffer.from([..._pbint(1,38073),..._pbint(2,33),..._pbbytes(4,sub),..._pbint(12,1)])
    : Buffer.from([..._pbint(1,38073),..._pbint(2,33),..._pbint(3,0),..._pbbytes(4,sub),..._pbstr(6,'android 9.2.66')])
}
function _farmCodeOf(hex){
  const top=_pbfields(Buffer.isBuffer(hex)?hex:Buffer.from(String(hex).replace(/^0x/i,''),'hex'))
  const inner=top[4]&&_pbfields(top[4][0])
  const v=inner&&inner[3]&&inner[3][0]
  const code=Buffer.isBuffer(v)?v.toString('utf8'):(typeof v==='string'?v:'')
  if(!code)throw new Error('回包里没有 code')
  return code
}
function _isOneBotBot(b){return !!(b&&b.adapter&&b.adapter.name==='OneBotv11')}
function _levelsOf(b){return [b,b.icqq,b.icqq&&b.icqq.icqq,b.icqq&&b.icqq.client,b.client,b.core].filter(Boolean)}
function _farmPickBot(prefer,uin){
  const cands=[prefer]
  const all=globalThis.Bot
  if(all)for(const k of Object.keys(all))if(/^\d{5,}$/.test(k))cands.push(all[k])
  for(const b of cands){
    if(!b)continue
    const id=String(b.uin||b.self_id||'')
    if(!/^\d{5,}$/.test(id))continue
    if(uin&&id!==String(uin))continue
    if(_isOneBotBot(b))return {bot:b,uin:id,onebot:true}
    if(_levelsOf(b).some(x=>typeof x.sendUni==='function'))return {bot:b,uin:id,onebot:false}
  }
  return null
}
async function _farmCode(w){
  const cmd='OidbSvcTrpcTcp.0x94b9_33'
  if(w.onebot){
    const hex=_farmBody(true).toString('hex')
    const app=String(w.bot.version&&w.bot.version.app_name||'')
    const req=app==='LLOneBot'
      ? await w.bot.sendApi('send_pb',{cmd,hex})
      : await w.bot.sendApi(app==='Lagrange.OneBot'?'.send_packet':'send_packet',{cmd,command:cmd,data:hex})
    const d=req&&(req.data!==undefined?req.data:req)
    const raw=typeof d==='string'?d:(d&&(d.result||d.hex||(typeof d.data==='string'?d.data:'')))
    if(!raw)throw new Error('本机账号没有回包')
    return _farmCodeOf(raw)
  }
  let uni=null,pb=null
  for(const x of _levelsOf(w.bot)){
    if(!uni&&typeof x.sendUni==='function')uni=x
    if(!pb&&x.core&&x.core.pb&&x.core.pb.encode)pb=x.core.pb
    if(!pb&&x.pb&&x.pb.encode)pb=x.pb
  }
  if(!uni||!pb)throw new Error('本机账号不支持取码')
  const obj=pb.decodePb(await uni.sendUni(cmd,pb.encode({1:38073,2:33,3:0,4:{1:'1112386029'},6:'android 9.2.66'})))
  const code=obj&&obj[4]&&obj[4][3]
  if(!code)throw new Error('回包里没有 code')
  return String(code)
}
async function _sameAccounts(uin){
  const list=((await _0x565d77['call']('accounts.list')).accounts)||[]
  const u=String(uin)
  return list.filter(a=>String(a.platform||'qq')==='qq'&&(String(a.uin||a.qq||'')===u||String(a.name||'')===u))
}
async function _dedupeAccounts(uin,keepId){
  const keep=String(keepId||'')
  if(!keep)return
  for(const a of await _sameAccounts(uin)){
    if(String(a.id)===keep)continue
    try{await _0x565d77['call']('accounts.remove',{id:String(a.id)})}catch{}
  }
}
async function loginByPacket(plugin,e,uin){
  if(!(e.isMaster||(e.sender&&e.sender.isMaster)))return false
  const say=s=>plugin.reply(e,s)
  const w=_farmPickBot(e.bot,uin)
  if(!w)return say('❎ 本机没有在线的 '+uin+'，取不到 code')
  const _same = await _sameAccounts(uin).catch(() => [])
  const _online = _same.find(a => a.running)
  if (_online) return say('✅ ' + uin + ' 已经在挂机（#' + _online.id + '），不用再登录')
  await say('⏳ 正在用 '+uin+' 取农场 code…')
  let code
  try{code=await _farmCode(w)}catch(err){return say('❎ 取码失败：'+(err&&err.message||err))}
  let acc
  try{
    acc=await _0x565d77['call']('login.code',{name:String(uin),code,platform:'qq',uin:String(uin)},90000)
  }catch(err){return say('【登录失败】'+(err&&err.message||err))}
  if(!acc||!acc.id)return say('【登录失败】农场引擎没有返回账号')
  try { await _dedupeAccounts(uin, acc.id) } catch {}
  try{_0x5db0af['bind'](plugin.uid(e),acc.id)}catch{}
  return say(['【登录成功】','· 账号：'+(acc.name||uin)+'（#'+acc.id+'）',acc.started?'· 已开始挂机，自动化按设置执行':'· 账号已保存，但启动失败（code 可能已过期）','· 注意：code 会过期，掉线后重新发本条指令即可'].join('\x0a'))
}
/* ---- QQ 号掉线自动换码重登 ---- */
const _auto = { busy: false, day: '', used: {}, fail: {}, last: {}, timer: null }
function _autoUsed(id) {
  const day = new Date().toLocaleDateString('en-CA')
  if (_auto.day !== day) { _auto.day = day; _auto.used = {}; _auto.fail = {} }
  return _auto.used[id] || 0
}
function _autoBlocked(id) { return (_auto.fail[id] || 0) >= 3 || _autoUsed(id) >= 8 }
async function _autoRefreshOne(engine, a) {
  const uin = String(a.uin || a.qq || (/^\d{5,12}$/.test(String(a.name || '')) ? a.name : '') || '')
  if (!uin) return
  if (_autoBlocked(a.id)) return
  const w = _farmPickBot(null, uin)
  if (!w) return
  _auto.used[a.id] = _autoUsed(a.id) + 1
  if (_auto.used[a.id] > 8) return
  let code
  try { code = await _farmCode(w) } catch (err) {
    _auto.fail[a.id] = (_auto.fail[a.id] || 0) + 1
    console.log('[Tci-Farm] 自动换码失败 ' + a.id + '：' + (err && err.message || err))
    return
  }
  let res
  const before = ((await engine.call('accounts.list')).accounts || []).map(x => String(x.id))
  try {
    res = await engine.call('login.code', { id: String(a.id), name: a.name, code, platform: 'qq', uin: String(uin) }, 90000)
  } catch (err) {
    _auto.fail[a.id] = (_auto.fail[a.id] || 0) + 1
    console.log('[Tci-Farm] 自动重登失败 ' + a.id + '：' + (err && err.message || err))
    return
  }
  try { await _dedupeAccounts(uin, res && res.id) } catch {}
  const after = (await engine.call('accounts.list')).accounts || []
  const extra = after.filter(x => !before.includes(String(x.id)))
  for (const x of extra) { try { await engine.call('accounts.remove', { id: String(x.id) }) } catch {} }
  if (extra.length) {
    _auto.fail[a.id] = (_auto.fail[a.id] || 0) + 1
    console.log('[Tci-Farm] 自动重登出现重复账号，已清理：' + a.id)
    return
  }
  _auto.fail[a.id] = 0
  console.log('[Tci-Farm] 已自动换码重登：' + a.id + '（' + uin + '）')
}
async function _autoWatch(engine) {
  if (_auto.busy) return
  _auto.busy = true
  try {
    const list = ((await engine.call('accounts.list')).accounts || [])
    for (const a of list) {
      if (String(a.platform || 'qq') !== 'qq') continue
      if (a.running) { _auto.fail[a.id] = 0; continue }
      const now = Date.now()
      if (!_auto.last[a.id] || now - _auto.last[a.id] >= 120000) {
        _auto.last[a.id] = now
        await _autoRefreshOne(engine, a)
      }
    }
  } catch (err) {
    console.log('[Tci-Farm] 自动换码巡查失败：' + (err && err.message || err))
  } finally {
    _auto.busy = false
  }
}
function _autoBoot(boot) {
  if (boot.autoTimer) clearInterval(boot.autoTimer)
  const t = setInterval(() => _autoWatch(_0x565d77), 60000)
  if (t.unref) t.unref()
  boot.autoTimer = t
}


// 启动后清理同号重复账号（保留在线的一个，其次保留编号最大的）
setTimeout(async () => {
  try {
    const list = ((await _0x565d77['call']('accounts.list')).accounts) || []
    const groups = {}
    for (const a of list) {
      const u = String(a.uin || a.qq || a.name || '')
      if (!u) continue
      ;(groups[u] = groups[u] || []).push(a)
    }
    for (const u of Object.keys(groups)) {
      const g = groups[u]
      if (g.length < 2) continue
      const keep = g.find(x => x.running) || g.slice().sort((x, y) => Number(y.id) - Number(x.id))[0]
      for (const a of g) {
        if (String(a.id) === String(keep.id)) continue
        try { await _0x565d77['call']('accounts.remove', { id: String(a.id) }) } catch {}
      }
    }
  } catch {}
}, 20000)
