/*!
 * ExpressionEngine - by EllisLab
 *
 * @package		ExpressionEngine
 * @author		EllisLab Dev Team
 * @copyright	Copyright (c) 2003 - 2013, EllisLab, Inc.
 * @license		http://ellislab.com/expressionengine/user-guide/license.html
 * @link		http://ellislab.com
 * @since		Version 2.0
 * @filesource
 */

EE.publish=EE.publish||{};
EE.publish.category_editor=function(){var b=[],d=$("<div />"),e=$('<div id="cat_modal_container" />').appendTo(d),c={},k={},h=EE.BASE+"&C=admin_content&M=category_editor&group_id=",j,g,a,i={},l=$("<div />");e.css({height:"100%",padding:"0 20px 0 0",overflow:"auto"});d.dialog({autoOpen:!1,height:475,width:600,modal:!0,resizable:!1,title:EE.publish.lang.edit_category,open:function(){$(".ui-dialog-content").css("overflow","hidden");$(".ui-dialog-titlebar").focus();$("#cat_name").focus();EE.publish.file_browser.category_edit_modal()}});
$(".edit_categories_link").each(function(){var a=this.href.substr(this.href.lastIndexOf("=")+1);$(this).data("gid",a);b.push(a)});for(a=0;a<b.length;a++)c[b[a]]=$("#cat_group_container_"+[b[a]]),c[b[a]].data("gid",b[a]),k[b[a]]=$("#cat_group_container_"+[b[a]]).find(".cat_action_buttons").remove();j=function(a){c[a].text("loading...").load(h+a+"&timestamp="+ +new Date+" .pageContents table",function(){g.call(c[a],c[a].html(),!1)})};g=function(a,f){var c=$(this),b=c.data("gid"),a=$.trim(a);c.hasClass("edit_categories_link")&&
(c=$("#cat_group_container_"+b));if("<"!==a.charAt(0)&&f)return j(b);c.closest(".cat_group_container").find("#refresh_categories").show();var m=$(a),i,h,n;if(m.find("form").length){e.html(m);m=e.find("input[type=submit]");i=e.find("form");h=i.find("#cat_name");n=i.find("#cat_url_title");h.keyup(function(){h.ee_url_title(n)});var o=function(a){var f=a||$(this),a=f.serialize(),f=f.attr("action");$.ajax({url:f,type:"POST",data:a,dataType:"html",beforeSend:function(){l.html(EE.lang.loading)},success:function(a){a=
$.trim(a);d.dialog("close");"<"==a[0]?(a=$(a).find(".pageContents"),0==a.find("form").length&&l.html(a),a=a.wrap("<div />").parent(),g.call(c,a.html(),!0)):g.call(c,a,!0)},error:function(a){a=$.parseJSON(a.responseText);d.html(a.error)}});return!1};i.submit(o);var p={};p[m.remove().attr("value")]={text:EE.publish.lang.update,click:function(){o(i)}};d.dialog("open");d.dialog("option","buttons",p);d.one("dialogclose",function(){j(b)})}else k[b].clone().appendTo(c).show();return!1};a=function(a){a.preventDefault();
$(this).hide();var f=$(this).data("gid"),b=".pageContents";if($(this).hasClass("edit_cat_order_trigger")||$(this).hasClass("edit_categories_link"))b+=" table";f||(f=$(this).closest(".cat_group_container").data("gid"));$(this).hasClass("edit_categories_link")&&(i[f]=c[f].find("input:checked").map(function(){return this.value}).toArray());c[f].find("label").hide();c[f].append(l.html(EE.lang.loading));$.ajax({url:$(this).attr("href")+"&timestamp="+ +new Date+b,dataType:"html",success:function(a){var d=
"",a=$.trim(a);"<"==a.charAt(0)&&(a=$(a).find(b),d=$("<div />").append(a).html(),0==a.find("form").length&&l.html(d));g.call(c[f],d,!0)},error:function(a){a=$.parseJSON(a.responseText);l.text(a.error);g.call(c[f],a.error,!0)}})};$(".edit_categories_link").click(a);$(".cat_group_container a:not(.cats_done, .choose_file)").live("click",a);$(".cats_done").live("click",function(){var a=$(this).closest(".cat_group_container"),f=a.data("gid");$(".edit_categories_link").each(function(){$(this).data("gid")==
f&&$(this).show()});a.text("loading...").load(EE.BASE+"&C=content_publish&M=category_actions&group_id="+a.data("gid")+"&timestamp="+ +new Date,function(b){a.html($(b).html());$.each(i[f],function(f,b){a.find("input[value="+b+"]").attr("checked","checked")})});return!1})};EE.publish.get_percentage_width=function(b){var d=/[0-9]+/ig,e=b.attr("data-width");return e&&d.test(e.slice(0,-1))?parseInt(e,10):10*Math.round(10*(b.width()/b.parent().width()))};
EE.publish.save_layout=function(){var b=0,d={},e={},c=0,k=!1,h=$("#tab_menu_tabs li.current").attr("id");$(".main_tab").show();$("#tab_menu_tabs a:not(.add_tab_link)").each(function(){if($(this).parent("li").attr("id")&&"menu_"==$(this).parent("li").attr("id").substring(0,5)){var g=$(this).parent("li").attr("id").substring(5),a=$(this).parent("li").attr("id").substring(5),i=$(this).parent("li").attr("title");c=0;visible=!0;$(this).parent("li").is(":visible")?(lay_name=g,d[b]={name:lay_name,fields:{}},
d[b]._tab_label=i):(k=!0,visible=!1);$("#"+a).find(".publish_field").each(function(){var a=$(this),g=this.id.replace(/hold_field_/,""),a=EE.publish.get_percentage_width(a),f=$("#sub_hold_field_"+g+" .markItUp ul li:eq(2)");100<a&&(a=100);f="undefined"!==f.html()&&"none"!==f.css("display")?!0:!1;a={visible:"none"===$(this).css("display")||!1===visible?!1:!0,collapse:"none"===$("#sub_hold_field_"+g).css("display")?!0:!1,htmlbuttons:f,width:a+"%"};!0===visible?(a.index=c,d[b].fields[g]=a,c+=1):e[g]=
a});!0===visible&&b++}});if(!0==k){var j=0;for(field in d[0].fields)field.index>j&&(j=field.index);$.each(e,function(){this.index=++j});jQuery.extend(d[0].fields,e)}EE.tab_focus(h.replace(/menu_/,""));0===b?$.ee_notice(EE.publish.lang.tab_count_zero,{type:"error"}):0===$("#layout_groups_holder input:checked").length?$.ee_notice(EE.publish.lang.no_member_groups,{type:"error"}):$.ajax({type:"POST",dataType:"json",url:EE.BASE+"&C=content_publish&M=save_layout",data:"json_tab_layout="+encodeURIComponent(JSON.stringify(d))+
"&"+$("#layout_groups_holder input").serialize()+"&channel_id="+EE.publish.channel_id,success:function(b){"success"===b.messageType?$.ee_notice(b.message,{type:"success"}):"failure"===b.messageType&&$.ee_notice(b.message,{type:"error"})}})};
EE.publish.remove_layout=function(){if(0===$("#layout_groups_holder input:checked").length)return $.ee_notice(EE.publish.lang.no_member_groups,{type:"error"});$.ajax({type:"POST",url:EE.BASE+"&C=content_publish&M=save_layout",data:"json_tab_layout={}&"+$("#layout_groups_holder input").serialize()+"&channel_id="+EE.publish.channel_id+"&field_group="+EE.publish.field_group,success:function(){$.ee_notice(EE.publish.lang.layout_removed+' <a href="javascript:location=location">'+EE.publish.lang.refresh_layout+
"</a>",{duration:0,type:"success"});return!0}});return!1};EE.publish.change_preview_link=function(){$select=$("#layout_preview select");$link=$("#layout_group_preview");base=$link.attr("href").split("layout_preview")[0];$link.attr("href",base+"layout_preview="+$select.val());$.ajax({url:EE.BASE+"&C=content_publish&M=preview_layout",type:"POST",dataType:"json",data:{member_group:$select.find("option:selected").text()}})};file_manager_context="";
function disable_fields(b){var d=$(".main_tab input, .main_tab textarea, .main_tab select, #submit_button"),e=$("#submit_button"),c=$("#holder").find("a");b?(disabled_fields=d.filter(":disabled"),d.attr("disabled",!0),e.addClass("disabled_field"),c.addClass("admin_mode"),$("#holder div.markItUp, #holder p.spellcheck").each(function(){$(this).before('<div class="cover" style="position:absolute;width:98%;height:50px;z-index:9999;"></div>').css({})}),$(".contents, .publish_field input, .publish_field textarea").css("-webkit-user-select",
"none")):(d.removeAttr("disabled"),e.removeClass("disabled_field"),c.removeClass("admin_mode"),$(".cover").remove(),disabled_fields.attr("disabled",!0),$(".contents, .publish_field input, .publish_field textarea").css("-webkit-user-select","auto"))}
$(document).ready(function(){var b,d;$("#layout_group_submit").click(function(){EE.publish.save_layout();return!1});$("#layout_group_remove").click(function(){EE.publish.remove_layout();return!1});$("#layout_preview select").change(function(){EE.publish.change_preview_link()});$("a.reveal_formatting_buttons").click(function(){$(this).parent().parent().children(".close_container").slideDown();$(this).hide();return!1});$("#write_mode_header .reveal_formatting_buttons").hide();$("a.glossary_link").click(function(){$(this).parent().siblings(".glossary_content").slideToggle("fast");
$(this).parent().siblings(".smileyContent .spellcheck_content").hide();return!1});!0===EE.publish.smileys&&($("a.smiley_link").toggle(function(){$(this).parent().siblings(".smileyContent").slideDown("fast",function(){$(this).css("display","")})},function(){$(this).parent().siblings(".smileyContent").slideUp("fast")}),$(this).parent().siblings(".glossary_content, .spellcheck_content").hide(),$(".glossary_content a").click(function(){var b=$(this).closest(".publish_field"),a=b.attr("id").replace("hold_field_",
"field_id_");b.find("#"+a).insertAtCursor($(this).attr("title"));return!1}));if(EE.publish.autosave&&EE.publish.autosave.interval){var e=!1;d=function(){e||(e=!0,setTimeout(b,1E3*EE.publish.autosave.interval))};b=function(){var b;1===$("#tools:visible").length?d():(b=$("#publishForm").serialize(),$.ajax({type:"POST",dataType:"json",url:EE.BASE+"&C=content_publish&M=autosave",data:b,success:function(a){a.error?console.log(a.error):a.success?(a.autosave_entry_id&&$("input[name=autosave_entry_id]").val(a.autosave_entry_id),
$("#autosave_notice").text(a.success)):console.log("Autosave Failed");e=!1}}))};var c=$("textarea, input").not(":password,:checkbox,:radio,:submit,:button,:hidden"),k=$("select, :checkbox, :radio, :file");c.bind("keypress change",d);k.bind("change",d)}if(EE.publish.pages){var c=$("#pages__pages_uri"),h=EE.publish.pages.pagesUri;c.val()||c.val(h);c.focus(function(){this.value===h&&$(this).val("")}).blur(function(){""===this.value&&$(this).val(h)})}void 0!==EE.publish.markitup.fields&&$.each(EE.publish.markitup.fields,
function(b){$("#"+b).markItUp(mySettings)});EE.publish.setup_writemode=function(){var b=$("#write_mode_writer"),a=$("#write_mode_textarea"),c,d,e;a.markItUp(myWritemodeSettings);$(window).resize(function(){var a=$(this).height()-117;b.css("height",a+"px").find("textarea").css("height",a-67-17+"px")}).triggerHandler("resize");$(".write_mode_trigger").overlay({closeOnEsc:!1,closeOnClick:!1,top:"center",target:"#write_mode_container",mask:{color:"#262626",loadSpeed:200,opacity:0.85},onBeforeLoad:function(){var b=
this.getTrigger()[0].id;e=b.match(/^id_\d+$/)?$("#field_"+b):$("#"+b.replace(/id_/,""));c=e.getSelectedRange();a.val(e.val())},onLoad:function(){a.focus();a.createSelection(c.start,c.end);var b=this;b.getClosers().unbind("click").click(function(a){a.srcElement=this;b.close(a)})},onBeforeClose:function(b){b=$(b.srcElement).closest(".close");b.hasClass("publish_to_field");b.hasClass("publish_to_field")&&(d=a.getSelectedRange(),e.val(a.val()),e.createSelection(d.start,d.end));e.focus()}})};!0===EE.publish.show_write_mode&&
EE.publish.setup_writemode();$(".hide_field span").click(function(){var b=$(this).parent().parent().attr("id").substr(11),a=$("#hold_field_"+b),b=$("#sub_hold_field_"+b);"block"==b.css("display")?(b.slideUp(),a.find(".ui-resizable-handle").hide(),a.find(".field_collapse").attr("src",EE.THEME_URL+"images/field_collapse.png")):(b.slideDown(),a.find(".ui-resizable-handle").show(),a.find(".field_collapse").attr("src",EE.THEME_URL+"images/field_expand.png"));return!1});$(".close_upload_bar").toggle(function(){$(this).parent().children(":not(.close_upload_bar)").hide();
$(this).children("img").attr("src",EE.THEME_URL+"publish_plus.png")},function(){$(this).parent().children().show();$(this).children("img").attr("src",EE.THEME_URL+"publish_minus.gif")});$(".ping_toggle_all").toggle(function(){$("input.ping_toggle").each(function(){this.checked=!1})},function(){$("input.ping_toggle").each(function(){this.checked=!0})});EE.user.can_edit_html_buttons&&($(".markItUp ul").append('<li class="btn_plus"><a title="'+EE.lang.add_new_html_button+'" href="'+EE.BASE+"&C=myaccount&M=html_buttons&id="+
EE.user_id+'">+</a></li>'),$(".btn_plus a").click(function(){return confirm(EE.lang.confirm_exit,"")}));$(".markItUpHeader ul").prepend('<li class="close_formatting_buttons"><a href="#"><img width="10" height="10" src="'+EE.THEME_URL+'images/publish_minus.gif" alt="Close Formatting Buttons"/></a></li>');$(".close_formatting_buttons a").toggle(function(){$(this).parent().parent().children(":not(.close_formatting_buttons)").hide();$(this).parent().parent().css("height","13px");$(this).children("img").attr("src",
EE.THEME_URL+"images/publish_plus.png")},function(){$(this).parent().parent().children().show();$(this).parent().parent().css("height","auto");$(this).children("img").attr("src",EE.THEME_URL+"images/publish_minus.gif")});$(".tab_menu li:first").addClass("current");!0==EE.publish.title_focus&&$("#title").focus();"new"==EE.publish.which&&$("#title").bind("keyup blur",function(){$("#title").ee_url_title($("#url_title"))});"n"==EE.publish.versioning_enabled?$("#revision_button").hide():$("#versioning_enabled").click(function(){$(this).attr("checked")?
$("#revision_button").show():$("#revision_button").hide()});EE.publish.category_editor();if(EE.publish.hidden_fields){EE._hidden_fields=[];var j=$("input");$.each(EE.publish.hidden_fields,function(b){EE._hidden_fields.push(j.filter("[name="+b+"]")[0])});$(EE._hidden_fields).after('<p class="hidden_blurb">This module field only shows in certain circumstances. This is a placeholder to let you define it in your layout.</p>')}});
