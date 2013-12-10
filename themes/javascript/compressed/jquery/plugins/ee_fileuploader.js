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

(function(a){var c,g,d,f,l=!0;a.ee_fileuploader=function(b){d=a.extend({},{},b);a.ee_filebrowser.endpoint_request("setup_upload",function(b){c=a(b.uploader);a(document.body).append(c);_EE_uploader_attached()})};a.ee_fileuploader.setSource=function(b,e){c.find(b).attr("src",e);c=c.first();c.removeClass().addClass("before_upload");"filemanager"==d.type?c.find(".button_bar .filebrowser").remove():"filebrowser"==d.type&&c.find(".button_bar .filemanager").remove();a(document).ready(function(){a.ee_fileuploader.build_dialog()});
"function"==typeof d.load&&d.load.call(this,c)};a.ee_fileuploader.build_dialog=function(){c.dialog({width:600,height:370,resizable:!1,position:["center","center"],modal:!0,draggable:!0,title:EE.fileuploader.window_title,autoOpen:!1,zIndex:99999,open:function(){h("before_upload");f={};a("#file_uploader .button_bar .loading").addClass("visualEscapism");a.ee_fileuploader.reset_upload();void 0===g&&(g=c.html());"function"==typeof d.open&&d.open.call(this,c);k()},close:function(){"undefined"!=typeof window.upload_iframe.file&&
(l&&a.ajax({url:EE.BASE+"&"+EE.fileuploader.delete_url,type:"POST",dataType:"json",data:{file:f.file_id,XID:EE.XID},error:function(a,c,d){console.log(c)}}),"function"==typeof d.close&&d.close.call(this,c,f));c.html(g)}});a(document).on("click",d.trigger,function(a){a.preventDefault();c.dialog("open")})};var k=function(){a("#file_uploader .button_bar #rename_file").click(function(b){b.preventDefault();a("#file_uploader iframe").contents().find("form").trigger("submit")});a("#file_uploader .button_bar .cancel").live("click",
function(b){b.preventDefault();$iframe=a("#file_uploader iframe").contents();$iframe.find("#edit_file_metadata").size()?($iframe.find("#resize input").each(function(b){a(this).val(a(this).data("default")).removeClass("oversized")}),$iframe.find("#rotate input").prop("checked",!1)):c.dialog("close")})};a.ee_fileuploader.reset_upload=function(b){"undefined"==typeof b&&(b=!0);a("#file_uploader .button_bar .loading").addClass("visualEscapism");!0===b&&a("#file_uploader .button_bar #upload_file").addClass("disabled-btn").removeClass("submit").unbind()};
a.ee_fileuploader.enable_upload=function(){a("#file_uploader .button_bar #upload_file").addClass("submit").removeClass("disabled-btn").click(function(b){b.preventDefault();a("#file_uploader .button_bar .loading").removeClass("visualEscapism");a("#file_uploader iframe").contents().find("form").trigger("submit")})};var m=function(){c.dialog("close");a.ee_filebrowser.clean_up(f)};a.ee_fileuploader.set_directory_id=function(b){if(!isNaN(parseInt(b,10))){var e=c.find("iframe").attr("src"),d=e.search("&directory_id="),
f=a.ee_filebrowser.get_current_settings();0<d&&(e=e.substring(0,d));e=e+"&directory_id="+b;0>=a(".dir_choice_container:visible").size()&&(e+="&restrict_directory=true");f&&"image"==f.content_type&&(e+="&restrict_image=true");c.find("iframe").attr("src",e);return b}return!1};a.ee_fileuploader.file_exists=function(b){a.ee_fileuploader.update_file(b);h("file_exists")};a.ee_fileuploader.after_upload=function(b){a.ee_fileuploader.update_file(b);l=!1;"function"==typeof d.after_upload&&d.after_upload.call(this,
c,f);h("after_upload");a("#edit_image").toggle(b.is_image);if("filemanager"==d.type){a("#file_uploader .button_bar").on("click","#browse_files",function(a){m();a.preventDefault()});b=["edit_file","edit_image"];for(var e=0,g=b.length;e<g;e++){var k=a(".mainTable tr.new:first td:has(img) a[href*="+b[e]+"]").attr("href");a("#"+b[e],"#file_uploader .button_bar").attr("href",k)}}else"filebrowser"==d.type&&(a("#file_uploader .button_bar").on("click","#choose_file",function(a){m();a.preventDefault()}),a("#file_uploader .button_bar").on("click",
"#edit_file_modal",function(b){a("#file_uploader iframe").contents().find("form#edit_file").trigger("submit");h("edit_modal");b.preventDefault()}),a("#file_uploader .button_bar").on("click","#save_file",function(b){a("#file_uploader iframe").contents().find("form#edit_file_metadata").trigger("submit");b.preventDefault()}))};a.ee_fileuploader.update_file=function(a){f=a};var h=function(b){a("#file_uploader").removeClass("before_upload after_upload file_exists edit_modal").addClass(b)}})(jQuery);
