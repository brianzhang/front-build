/**
  Template Module Generated by KissyPie 
 **/
KISSY.add(function(){
    return {"html":"<h4>Module Compiler:</h4>\r\n{{#if !files.length}}\r\n    <div>\r\n        没有找到Kissy模块\r\n    </div>\r\n{{#else}}\r\n    <ul class=\"plugin-file-list\">\r\n        {{#each files as file}}\r\n            <li>\r\n                <h5 class=\"ks-module status-{{file.status}}\">\r\n                    <strong title='{{file.path}}'>{{file.name}}</strong>\r\n                    <span>{{file.status}}</span>\r\n                    {{#if file.status !== 'ok'}}\r\n                        <span class=\"status\">[{{file.status}}]</span>\r\n                    {{/if}}\r\n                </h5>\r\n                {{#if file.submods.length}}\r\n                    <ul class=\"submods\">\r\n                        {{#each file.submods as mod}}\r\n                        <li class='status-{{mod.status}}'>\r\n                            <strong title='{{mod.path}}'>{{mod.name}}</strong>\r\n                            {{#if mod.status !== 'ok'}}\r\n                            <span class=\"status\">[{{mod.status}}]</span>\r\n                            {{/if}}\r\n                        </li>\r\n                        {{/each}}\r\n                    </ul>\r\n                {{#else}}\r\n                    \r\n                {{/if}}\r\n            </li>\r\n        {{/each}}\r\n    </ul>\r\n{{/if}}"};
});
