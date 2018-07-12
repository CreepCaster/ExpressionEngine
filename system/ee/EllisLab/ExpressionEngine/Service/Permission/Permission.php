<?php
/**
 * ExpressionEngine (https://expressionengine.com)
 *
 * @link      https://expressionengine.com/
 * @copyright Copyright (c) 2003-2018, EllisLab, Inc. (https://ellislab.com)
 * @license   https://expressionengine.com/license
 */

namespace EllisLab\ExpressionEngine\Service\Permission;

/**
 * Permission Service
 */
class Permission {

	/**
	 * @var array $userdata An array of the session userdata
	 */
	protected $userdata;

	/**
	 * @var array $permissions An array of granted permissions
	 */
	protected $permissions;

	/**
	 * Constructor: sets the userdata.
	 *
	 * @param array $userdata The session userdata array
	 */
	public function __construct(array $userdata = [], array $permissions = [])
	{
		$this->userdata = $userdata;
		$this->permissions = $permissions;
	}

	/**
	 * Has a single permission
	 *
	 * Member access validation
	 *
	 * @param	string  single permission name
	 * @return	bool    TRUE if member has permission
	 */
	public function has()
	{
		$which = func_get_args();

		if (count($which) !== 1)
		{
			throw new \BadMethodCallException('Invalid parameter count, must have exactly 1.');
		}

		return $this->hasAll($which[0]);
	}

	/**
	 * Has All
	 *
	 * Member access validation
	 *
	 * @param	mixed   array or any number of permission names
	 * @return	bool    TRUE if member has all permissions
	 */
	public function hasAll()
	{

		$which = func_get_args();

		if ( ! count($which))
		{
			throw new \BadMethodCallException('Invalid parameter count, 1 or more arguments required.');
		}

		// Super Admins always have access
		if ($this->getUserdatum('group_id') == 1)
		{
			return TRUE;
		}

		foreach ($which as $w)
		{
			if ( ! $this->check($w))
			{
				return FALSE;
			}
		}

		return TRUE;
	}

	/**
	 * Has Any
	 *
	 * Member access validation
	 *
	 * @param	mixed   array or any number of permission names
	 * @return	bool    TRUE if member has any permissions in the set
	 */
	public function hasAny()
	{
		$which = func_get_args();

		if ( ! count($which))
		{
			throw new \BadMethodCallException('Invalid parameter count, 1 or more arguments required.');
		}

		// Super Admins always have access
		if ($this->getUserdatum('group_id') == 1)
		{
			return TRUE;
		}

		foreach ($which as $w)
		{
			if ($this->check($w))
			{
				return TRUE;
			}
		}

		return FALSE;
	}

	/**
	 * Check for the permission first looking in the userdata then in the permission array
	 *
	 * @param string $which any number of permission names
	 * @return bool TRUE if the permission is in the userdata or the permission key exists; FALSE otherwise
	 */
	protected function check($which)
	{
		$k = $this->getUserdatum($which);

		if ($k === TRUE OR $k == 'y')
		{
			return TRUE;
		}

		return array_key_exists($which, $this->permissions);
	}

	/**
	 * Get user datum
	 *
	 * Member access validation
	 *
	 * @param	string $which any number of permission names
	 * @return	mixed    False if the requested userdata array key doesn't exist
	 *							otherwise returns the key's value
	 */
	protected function getUserdatum($which)
	{
		return ( ! isset($this->userdata[$which])) ? FALSE : $this->userdata[$which];
	}

}
// EOF
