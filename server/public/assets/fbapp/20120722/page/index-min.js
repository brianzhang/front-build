KISSY.add("utils/build-page",function(a){function c(){var a=this;c.superclass.constructor.apply(a,arguments)}var b=a.all;return a.extend(c,a.Base,{build:function(b,d){var e=this;if(!b||!b.length){e.fire(c.EV.ERROR,{message:"\u8bf7\u6307\u5b9aPage"});return}if(!a.trim(d)){e.fire(c.EV.ERROR,{message:"\u8bf7\u6307\u5b9a\u65f6\u95f4\u6233"});return}a.isString(b)&&(b=b.split(",")),a.ajax({url:e.get("url"),data:{timestamp:d,pages:b.join(","),root:e.get("rootDir")},cache:!1,dataType:"json",success:function(a){if(a.err){e.fire(c.EV.BUILD_ERROR,a.err);return}e.fire(c.EV.SUCCESS,{pages:b,timestamp:d}),a.reports&&e.fire(c.EV.REPORT,{reports:a.reports})}})}},{EV:{GROUP_BUILD:"group-build",ERROR:"error",REPORT:"report",SUCCESS:"success",BUILD_ERROR:"build-error"},ATTRS:{url:{value:"/build-pages"},rootDir:{value:""}}}),c}),KISSY.add("utils/build-common",function(a){var b=a.all;return{init:function(){var c=b("#fb-build-common"),d=c.siblings(".status");c.on("click",function(c){var e=b(c.target);c.preventDefault(),d.html("building..."),a.ajax({url:e.attr("href"),dataType:"json",success:function(a){if(a.err){var b=a.err;d.html("Error:"+b.message);return}d.html("success!"),setTimeout(function(){d.html("")},2e3)}})})}}}),KISSY.add("utils/calendar-init",function(a,b,c){var d=a.all;return{init:function(e){function g(a){var b=d(a.target);if(f.get("el").contains(b))return;if(b.attr("data-cal-trigger"))return;if(b.parent(".ks-cal-box"))return;f.hide()}d(e.triggers).attr("data-cal-trigger","1");var f=new c.Popup({width:192});f.render(),f.on("hide",function(){d(document.body).detach("click",g)}).on("show",function(){d(document.body).on("click",g)});var h=new b(f.get("contentEl"));h.on("select",function(b){this.targetInput&&d(this.targetInput).val(a.Date.format(b.date,"yyyymmdd")),f.hide()}),d(e.triggers).on("click",function(b){f.show();var c=d(b.target);f.align(c,["bl","tl"]),h.targetInput=c;var e=c.val();if(e){var g=e.match(/^(\d{2,4})(\d\d)(\d\d)$/);console.log(g);var i=a.Date.parse(g.slice(1).join("-"));h.render({date:i,selected:i})}})}}},{requires:["calendar","overlay","calendar/assets/base.css"]}),KISSY.add("utils/app-history",function(a){function c(){var a=localStorage.getItem(b);if(!a)return[];try{var c=a.split(",")}catch(d){return[]}return c}function d(a){return localStorage.setItem(b,a.join(","))}if(!window.localStorage)return null;var b="AppHistory";return{push:function(b){var e=c();e=a.filter(e,function(a){return a!=b}),e.unshift(b),d(e)},get:function(){var a=c();return a},rm:function(b){var e=c();return e=a.filter(e,function(a){return a!=b}),d(e),!0}}}),KISSY.add("utils/local-cache",function(a){function b(a){var b=this;b.KEY=a}return a.augment(b,{set:function(a,b){var c=this,d=c.KEY,e=c.getAll();e[a]=b,c.save()},save:function(){var a=this,b=a.KEY,c=a.getAll();localStorage.setItem(b,JSON.stringify(c))},get:function(a){var b=this,c=b.KEY,d=b.getAll();return d[a]},getAll:function(){var a=this,b=a.KEY;if(a._cache)return a._cache;var c=localStorage.getItem(b);return c?a._cache=JSON.parse(c)||{}:a._cache={},a.getAll()}}),b}),KISSY.add(function(a){function b(a){var b=this;b.KEY=a}return a.augment(b,{set:function(a,b){var c=this,d=c.KEY,e=c.getAll();e[a]=b,c.save()},save:function(){var a=this,b=a.KEY,c=a.getAll();localStorage.setItem(b,JSON.stringify(c))},get:function(a){var b=this,c=b.KEY,d=b.getAll();return d[a]},getAll:function(){var a=this,b=a.KEY;if(a._cache)return a._cache;var c=localStorage.getItem(b);return c?a._cache=JSON.parse(c)||{}:a._cache={},a.getAll()}}),b}),KISSY.add("page/mods/group-select",function(a){var b=a.all,c=".j-version-checkbox";a.ready(function(){b("body").delegate("click",".j-select-group",function(d){var e=b(d.target);d.preventDefault();var f=e.attr("title");f?f=f.split(","):f=[],b(c).each(function(b){a.indexOf(b.val(),f)>-1?b.prop("checked",!0):b.prop("checked",!1)})}).delegate("click",".j-version-checkbox",function(a){var d=b(a.target),e=d.val(),f=e.split("/")[0];b(c).each(function(a){var b=a.val();b!==e&&a.val().split("/")[0]===f&&a.prop("checked",!1)})})})}),KISSY.add("page/index",function(a,b,c,d,e,f){function h(b){g("#batch-build-timestamp").val(b.get("timestamp"));var c=b.get("pages");c&&g("input.j-version-checkbox").filter(function(b){return a.indexOf(b.value,c)>-1}).prop("checked",!0)}function i(a,c){var d=new b({rootDir:a.rootDir}),e=g("#batch-build-timestamp"),f=g("#batch-build-status"),h=g("#batch-build");h.on("click",function(a){a.preventDefault();var b=e.val(),c=[];g("input.j-version-checkbox").each(function(a){a.prop("checked")&&a.val()&&c.push(a.val())}),d.build(c,b)}),d.on("error",function(a){f.html(a.message).show()}).on("success",function(a){c.set("timestamp",a.timestamp),c.set("pages",a.pages),f.html("success"),setTimeout(function(){f.hide()},1500)})}function j(b){var g=new f("app-cache:"+b.rootDir);a.ready(function(){d.init({triggers:"input.timestamp-input"}),c.init(),i(b,g),e.push(b.rootDir),h(g)})}var g=a.all;return{init:j}},{requires:["utils/build-page","utils/build-common","utils/calendar-init","utils/app-history","utils/local-cache","./mods/group-select"]}); 