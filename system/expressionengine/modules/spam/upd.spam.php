<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * ExpressionEngine - by EllisLab
 *
 * @package		ExpressionEngine
 * @author		EllisLab Dev Team
 * @copyright	Copyright (c) 2003 - 2014, EllisLab, Inc.
 * @license		http://ellislab.com/expressionengine/user-guide/license.html
 * @link		http://ellislab.com
 * @since		Version 3.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * ExpressionEngine Spam Module
 *
 * @package		ExpressionEngine
 * @subpackage	Modules
 * @category	Modules
 * @author		EllisLab Dev Team
 * @link		http://ellislab.com
 */

class Spam_upd {

	public $version = M_E;
	private $name = 'Spam';

	function Spam_upd()
	{
		// Make a local reference to the ExpressionEngine super object
		$this->EE =& get_instance();
		ee()->load->dbforge();
	}

	// --------------------------------------------------------------------

	/**
	 * Module Installer
	 *
	 * @access	public
	 * @return	bool
	 */
	function install()
	{
		$data = array(
			'module_name' => 'Spam' ,
			'module_version' => $this->version,
			'has_cp_backend' => 'y'
		);

		ee()->db->insert('modules', $data);

		$fields = array(
			'vocabulary_id'	=> array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'auto_increment' => TRUE),
			'term'			=> array('type' => 'varchar' , 'constraint' => '32'),
			'count'			=> array('type' => 'int' , 'constraint' => '10')
		);

		ee()->dbforge->add_field($fields);
		ee()->dbforge->add_key('vocabulary_id', TRUE);
		ee()->dbforge->create_table('spam_vocabulary');

		$fields = array(
			'parameter_id'	=> array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'auto_increment' => TRUE),
			'term'			=> array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE),
			'class'			=> array('type' => 'tinyint' , 'constraint' => '1'),
			'mean'			=> array('type' => 'decimal' , 'constraint' => '16,12'),
			'variance'		=> array('type' => 'decimal' , 'constraint' => '16,12')
		);

		ee()->dbforge->add_field($fields);
		ee()->dbforge->add_key('parameter_id', TRUE);
		ee()->dbforge->create_table('spam_parameters');

		$fields = array(
			'training_id'	=> array('type' => 'int', 'constraint' => '10', 'unsigned' => TRUE, 'auto_increment' => TRUE),
			'source'		=> array('type' => 'text'),
			'class'			=> array('type' => 'tinyint' , 'constraint' => '1'),
		);

		ee()->dbforge->add_field($fields);
		ee()->dbforge->add_key('parameter_id', TRUE);
		ee()->dbforge->create_table('spam_training');

		// Install the extension

		$insert = array();

		// THe hooks where we want to filter content for spam
		$hooks = array(
			'channel_form_submit_entry_end'
		);

		foreach ($hooks as $hook)
		{
			$insert[] = array(
				'class'    => $this->name.'_ext',
				'hook'     => $hook,
				'method'   => 'filter_spam',
				'settings' => '',
				'priority' => 10,
				'version'  => $this->version,
				'enabled'  => 'y'
			);
		}

		ee()->db->insert_batch('extensions',$insert);

		return TRUE;
	}

	// --------------------------------------------------------------------

	/**
	 * Module Uninstaller
	 *
	 * @access	public
	 * @return	bool
	 */
	function uninstall()
	{
		ee()->db->select('module_id');
		$query = ee()->db->get_where('modules', array('module_name' => 'Spam'));

		ee()->db->where('module_id', $query->row('module_id'));
		ee()->db->delete('module_member_groups');

		ee()->db->where('module_name', 'Spam');
		ee()->db->delete('modules');

		ee()->db->where('class', 'Spam');
		ee()->db->delete('actions');

		ee()->db->where('class', 'Spam_mcp');
		ee()->db->delete('actions');

		ee()->dbforge->drop_table('spam_vocabulary');
		ee()->dbforge->drop_table('spam_parameters');
		ee()->dbforge->drop_table('spam_training');

		// Extension
		ee()->db->delete(
			'extensions',
			array('class' => $this->name.'_ext')
		);

		return TRUE;
	}

	function update($current='')
	{
		return TRUE;
	}

}
