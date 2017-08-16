<?php
/**
 * ExpressionEngine (https://expressionengine.com)
 *
 * @link      https://expressionengine.com/
 * @copyright Copyright (c) 2003-2017, EllisLab, Inc. (https://ellislab.com)
 * @license   https://expressionengine.com/license
 */

namespace EllisLab\ExpressionEngine\Service\Formatter;

use EE_Lang;

/**
 * Formatter
 */
class Formatter {

	/**
	 * @var mixed $content Content to be formatted, typically a string or int
	 **/
	protected $content;

	/**
	 * @var object $lang EE_Lang
	 **/
	protected $lang;

	/**
	 * Constructor
	 *
	 * @param mixed $content Content to be formatted, typically a string or int
	 * @param object EE_Lang
	 */
	public function __construct($content, EE_Lang $lang)
	{
		$this->content = $content;
		$this->lang = $lang;
		$this->lang->load('formatter');
	}

	/**
	 * When accessed as a string simply complile the content and return that
	 *
	 * @return string The content
	 */
	public function __toString()
	{
		return $this->compile();
	}

	/**
	 * Compiles and returns the content as a string. Typically this is used when you
	 * need to use the content as an array key, or want to json_encode() the content.
	 * Formatters can override this method if they need to handle or return non-string variables
	 *
	 * @return string The cotnent
	 */
	public function compile()
	{
		return (string) $this->content;
	}
}

// EOF
