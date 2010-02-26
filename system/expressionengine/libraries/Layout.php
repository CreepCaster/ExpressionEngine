<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * ExpressionEngine - by EllisLab
 *
 * @package		ExpressionEngine
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2003 - 2010, EllisLab, Inc.
 * @license		http://expressionengine.com/docs/license.html
 * @link		http://expressionengine.com
 * @since		Version 2.0
 * @filesource
 */
 
// ------------------------------------------------------------------------

/**
 * ExpressionEngine Publish Layout Class
 *
 * @package		ExpressionEngine
 * @subpackage	Control Panel
 * @category	Control Panel
 * @author		ExpressionEngine Dev Team
 * @link		http://expressionengine.com
 */
class Layout {
	
	var $custom_layout_fields = array();
	
	/**
	 * Constructor
	 *
	 * Get reference to EE SuperObject
	 */
	function Layout()
	{
		$this->EE =& get_instance();
	}

	// --------------------------------------------------------------------

	/**
	 * Remove Module Layout
	 *
	 * Removes fields created by module tabs from all layouts for all channels in all member groups
	 *
	 * @access	private
	 * @param	array
	 * @return	boolean
	 */
	function remove_module_layout($module = '', $remove_fields = array())
	{
		// No module declared or fields to remove? We're done.
		if ($module == '' OR empty($remove_fields))
		{
			return TRUE;
		}

		$this->EE->load->model('member_model');

		// Retrieve every custom layout, we need to inspect it for the set fields
		$all_layouts = $this->EE->member_model->get_all_group_layouts();

		// No layouts? We're done.
		if (empty($all_layouts))
		{
			return TRUE;
		}

		// The tab will be capitalized
		$module = ucfirst($module);

		// open each one
		foreach ($all_layouts as $layout)
		{
			$tabs = unserialize($layout['field_layout']);
			$changes = 0; // This is a marker to keep track of the number of changes. If its zero at the end, then no db entry is needed

			foreach ($tabs as $tab => $fields)
			{
				foreach ($fields as $field => $data)
				{
					if (array_search($field, $remove_fields) !== FALSE)
					{
						$changes++;
						unset($tabs[$tab][$field]);
					}
				}

				// Fields were removed, but the tab may still be there. Since we can't account for what might have
				// been moved there, let's check if its there, and if its empty. Assuming it is, remove it.
				if ($tab == $module AND count($tabs[$tab]) == 0)
				{
					unset($tabs[$tab]);
				}
			}

			// All done looping through the custom layout fields. Did anything change?
			if ($changes == 0)
			{
				return TRUE;
			}
			else
			{
				// Something changed, so we need to update this entry (model takes care of removing any already there)
				$this->EE->member_model->insert_group_layout($layout['member_group'], $layout['channel_id'], $tabs);
			}
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Update Layout
	 */
	function update_layout($edit = FALSE, $comment_date_fields = TRUE)
	{
// replaced by sync
	}



	function duplicate_layout($dupe_id, $channel_id)
	{
		$this->EE->load->model('member_model');
		
		$layouts = $this->EE->member_model->get_all_group_layouts($dupe_id);
		
		if (empty($layouts))
		{
			return;
		}
		
		// open each one
		foreach ($layouts as $layout)
		{
			$layout['field_layout'];
			
			$this->db->set("site_id", $layout['site_id']);
			$this->db->set("channel_id", $channel_id);
			$this->db->set("field_layout", $layout['field_layout']);
			$this->db->set("member_group", $layout['member_group']);

			$this->db->insert('layout_publish');
		}			
	}
	
	function delete_channel_layouts($channel_id)
	{
		$this->EE->load->model('member_model');
		$this->EE->member_model->delete_group_layout('', $channel_id);
	}

	function edit_layout_fields($field_info, $channel_id)
	{
		$this->EE->load->model('layout_model');
		
		if ( ! is_array($channel_id))
		{
			$channel_id = array($channel_id);
		}
		
		
		$this->EE->layout_model->edit_layout_fields($field_info, 'edit_fields', $channel_id);
	}


	// --------------------------------------------------------------------
	
	/**
	 * Updates saved publish layouts
	 *
	 * @access	public
	 * @param	array
	 * @return	bool
	 */
	function sync_layout($fields = array(), $channel_id = '', $changes_only = TRUE)
	{
		$this->EE->load->model('layout_model');

		$new_settings = array();
		$changed = array();
		$hide_fields = '';
		$hide_tab_fields = array();
		$show_fields = '';
		$show_tab_fields = array();
		
		$default_settings = array(
							'visible'		=> 'TRUE',
							'collapse'		=> 'FALSE',
							'htmlbuttons'	=> 'FALSE',
							'width'			=> '100%'
						);		
		
		$layout_fields = array('enable_versioning', 'show_url_title', 'show_author_menu', 'show_status_menu', 'show_date_menu', 'show_options_cluster', 'show_ping_cluster', 'show_categories_menu', 'show_pages_cluster', 'show_forum_cluster');
		
		foreach ($layout_fields as $field)
		{
			if (isset($fields[$field]))
			{
				$new_settings[$field] = $fields[$field];
			}
		}
		
		$this->EE->db->select('enable_versioning, show_url_title, show_author_menu, show_status_menu, show_date_menu, show_options_cluster, show_ping_cluster, show_categories_menu, show_pages_cluster, show_forum_cluster');
		$this->EE->db->where('channel_id', $channel_id);
		$current = $this->EE->db->get('channels');
		
		if ($current->num_rows() > 0)
		{
			 $row = $current->row_array(); 
//print_r($row);
//print_r($new_settings);
			
			foreach ($new_settings as $field => $val)
			{
				if ($val != $row[$field]) // Undefined index: show_author_menu
				{
					$changed[$field] = $val;
				}
			}
		}
		
		if ( ! empty ($changed))
		{
			foreach ($changed as $field => $val)
			{
				switch ($field) {
					case 'enable_versioning':

						if ($val == 'n')
						{
							$hide_tab_fields['revisions'] = array('revisions');
						}
						else
						{
							$show_tab_fields['revisions'] = array('revisions' => $default_settings);
						}

						break;
					case 'show_url_title':

						if ($val == 'n')
						{
							$hide_fields .= 'url_title,';
						}
						else
						{
							$show_fields .= 'url_title,';
						}

						break;
					case 'show_author_menu':

						if ($val == 'n')
						{
							$hide_fields .= 'author,';
						}
						else
						{
							$show_fields .= 'author,';
						}

						break;
					case 'show_status_menu':

						if ($val == 'n')
						{
							$hide_fields .= 'status,';
						}
						else
						{
							$show_fields .= 'status,';
						}

						break;
					case 'show_date_menu':

						if ($val == 'n')
						{
							$hide_tab_fields['date'] = array('entry_date', 'expiration_date', 'comment_expiration_date');
						}
						else
						{
							$show_tab_fields['date'] = array('entry_date', 'expiration_date', 'comment_expiration_date');
						}

						break;
					case 'show_options_cluster':

						if ($val == 'n')
						{
							$hide_tab_fields['options'] = array('status', 'author', 'options');
						}
						else
						{
							$show_tab_fields['options'] = array('status', 'author', 'options');
						}

						break;
					case 'show_ping_cluster':

						if ($val == 'n')
						{
							$hide_tab_fields['pings'] = array('ping');
						}
						else
						{
							$show_tab_fields['pings'] = array('ping');
						}

						break;																		
					case 'show_categories_menu':

						if ($val == 'n')
						{
							$hide_tab_fields['categories'] = array('category');
						}
						else
						{
							$show_tab_fields['categories'] = array('category');
						}

						break;	
					case 'show_pages_cluster':

						if ($val == 'n')
						{
							$hide_tab_fields['pages'] = array('pages_uri', 'pages_template_id');
						}
						else
						{
							$show_tab_fields['pages'] = array('pages_uri', 'pages_template_id');
						}

						break;							
					case 'show_forum_cluster':

						if ($val == 'n')
						{
							$hide_tab_fields['forum'] = array('forum_title', 'forum_body', 'forum_id', 'forum_topic_id');
						}
						else
						{
							$show_tab_fields['forum'] = array('forum_title', 'forum_body', 'forum_id', 'forum_topic_id');
						}

						break;	
					}
			}
		}
		
		if ( ! empty($hide_tab_fields))
		{
			$this->EE->layout_model->edit_layout_fields($hide_tab_fields, 'hide_tab_fields', $channel_id, TRUE);
		}
		
		if ($hide_fields != '')
		{
			$this->EE->layout_model->edit_layout_fields(explode(',', $hide_fields), 'hide_fields', $channel_id);
		}

		if ( ! empty($show_tab_fields))
		{
			$this->EE->layout_model->edit_layout_fields($show_tab_fields, 'show_tab_fields', $channel_id, TRUE);
		}

		if ($show_fields != '')
		{
			$this->EE->layout_model->edit_layout_fields(explode(',', $show_fields), 'show_fields', $channel_id);
		}
/*
echo '<pre>';
print_r($changed);		
print_r($show_fields);
print_r($hide_fields);
print_r($show_tab_fields);
print_r($hide_tab_fields);
exit;
		
*/		
		return;
	}

	
	// --------------------------------------------------------------------
	
	/**
	 * Updates saved publish layouts
	 *
	 * @access	public
	 * @param	array
	 * @return	bool
	 */
	function delete_layout_tabs($tabs = array(), $namespace = '', $channel_id = array())
	{
		if ( ! is_array($tabs) OR count($tabs) == 0)
		{
			return FALSE;
		}
		
		if ($namespace != '')
		{
			foreach ($tabs as $key => $val)
			{
				foreach ($val as $field_name => $data)
				{
					$tabs[$key][$namespace.'__'.$field_name] = $data;
					unset($tabs[$key][$field_name]);
				}
			}
		}
		
		$this->EE->load->model('layout_model');

		return $this->EE->layout_model->update_layouts($tabs, 'delete_tabs', $channel_id);
	}	

	// --------------------------------------------------------------------
	
	/**
	 * Add new tabs and associated fields to saved publish layouts
	 *
	 * @access	public
	 * @param	array
	 * @return	bool
	 */
	function add_layout_tabs($tabs = array(), $namespace = '', $channel_id = array())
	{
		if ( ! is_array($tabs) OR count($tabs) == 0)
		{
			return FALSE;
		}

		if ($namespace != '')
		{
			foreach ($tabs as $key => $val)
			{
				foreach ($val as $field_name => $data)
				{
					$tabs[$key][$namespace.'__'.$field_name] = $data;
					unset($tabs[$key][$field_name]);
				}
			}
		}


		$this->EE->load->model('layout_model');
		$this->EE->layout_model->update_layouts($tabs, 'add_tabs', $channel_id);
	}


	// --------------------------------------------------------------------

	
	/**
	 * Adds new fields to the saved publish layouts, creating the default tab if required
	 *
	 * @access	public
	 * @param	array
	 * @param	int
	 * @return	bool
	 */
	function add_layout_fields($tabs = array(), $channel_id = array())
	{
		if ( ! is_array($channel_id))
		{
			$channel_id = array($channel_id);
		}
		
		if ( ! is_array($tabs) OR count($tabs) == 0)
		{
			return FALSE;
		}

		$this->EE->load->model('layout_model');
		
		return $this->EE->layout_model->update_layouts($tabs, 'add_fields', $channel_id);
	}

	// --------------------------------------------------------------------
	
	/**
	 * Deletes fields from the saved publish layouts
	 *
	 * @access	public
	 * @param	array or string
	 * @param	int
	 * @return	bool
	 */
	function delete_layout_fields($tabs, $channel_id = array())
	{
		if ( ! is_array($channel_id))
		{
			$channel_id = array($channel_id);
		}

		if ( ! is_array($tabs))
		{
			$tabs = array($tabs);
		}
		
		$this->EE->load->model('layout_model');
	
		return $this->EE->layout_model->update_layouts($tabs, 'delete_fields', $channel_id);
	}

	
}
// END CLASS

/* End of file layout.php */
/* Location: ./system/expressionengine/libraries/layout.php */