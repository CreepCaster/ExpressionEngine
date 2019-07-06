/*!
 * This source file is part of the open source project
 * ExpressionEngine (https://expressionengine.com)
 *
 * @link      https://expressionengine.com/
 * @copyright Copyright (c) 2003-2019, EllisLab Corp. (https://ellislab.com)
 * @license   https://expressionengine.com/license Licensed under Apache License, Version 2.0
 */


class ColorPicker extends React.Component {

    static defaultProps = {
        // The input name
        inputName: '',
        // The input id
        inputId: '',
        // The input color
        initialColor: '',

        // Allowed Colors:
        //  - any: Allows choosing any color. Both the swatches and color controls will be shown
        //  - swatches: Does not allow any color to be picked that's not in the swatches or default color. Only the swatches will be shown.
        allowedColors: 'any',
        // Called when the color changes.
        onChange: null,
        // Prevents the onChange callback from being called more than once within the specified amount of time (milliseconds).
        onChangeDelay: 50,
        // The color to use when the user inputs an invalid color
        // Valid options:
        //  - color string: If a valid hex or rgb string is supplied, that color will be used on invalid input
        //  - null: On invalid input the return color and input will become empty
        defaultColor: null,
        // An array of colors.
        swatches: [],
        // If false, prevents the color from having transparency and hides the opacity slider
        enableOpacity: false
    }

    lastChangeColor = null

    constructor(props) {
        super(props)

        if (typeof SimpleColor === 'undefined') {
            console.error('Error: ColorPicker requires the SimpleColor class!')
            return
        }

        if (props.onChangeDelay != null) {
            this.colorChanged = _.throttle(this.colorChanged, props.onChangeDelay)
        }

        var initialColor = new SimpleColor(this.props.initialColor)
        initialColor = initialColor.isValid ? initialColor : null

        this.state = { selectedColor: this.getReturnColor(initialColor), showPanel: false, inputValue: this.getReturnColorStr(initialColor)}
    }

    componentDidMount() {
        if (this.props.componentDidMount != null) {
            this.props.componentDidMount()
        }

        // Bind the EE form validation to the color picker
        EE.cp.formValidation.bindInputs(ReactDOM.findDOMNode(this).parentNode);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedColor !== prevState.selectedColor) {
            // Notify when the color has changed
            this.colorChanged()
        }
    }

    showColorPanel = () => {
        this.setState({ showPanel: true }, () => {
            // Trigger a re-render so the slider knobs can be positioned properly
            this.selectColor(this.getReturnColor(this.state.selectedColor))
        })
    }

    hideColorPanel = () => {
        this.setState({ showPanel: false })
        this.selectColor(this.getReturnColor(this.state.selectedColor))
    }

    /** Selects a color optionally setting the input value to something other than the selected color return string */
    selectColor(newColor, inputValue = null) {
        inputValue = inputValue == null ? this.getReturnColorStr(newColor) : inputValue
        this.setState({ selectedColor: newColor, inputValue: inputValue })
    }

    /** Notifies that the color has changed by calling the onChange callback  */
    colorChanged() {
        if (!this.props.onChange)
            return

        var color = this.getReturnColorStr(this.state.selectedColor)

        if (this.lastChangeColor != color) {
            this.props.onChange(color)
            this.lastChangeColor = color
        }
    }

    onInputChange = (event) => {
        var inputColor = new SimpleColor(event.target.value)

        if (!inputColor.isValid)
            inputColor = null

        this.selectColor(inputColor, event.target.value)
    }

    onSwatchClick = (event) => {
        var clickedColor = new SimpleColor(event.currentTarget.dataset.color)

        if (clickedColor.isValid)
            this.selectColor(clickedColor)
    }

    onHueBoxMove = (pos) => {
        var rectOffset = this.hueBoxRef.getBoundingClientRect()

        var x = this.clamp(pos.x - rectOffset.left, 0, this.hueBoxRef.offsetWidth)
        var y = this.clamp(pos.y - rectOffset.top,  0, this.hueBoxRef.offsetHeight)

        var newColor = this.getSafeSelectedColor().withHsv({ s: x / this.hueBoxRef.offsetWidth, v: 1 - (y / this.hueBoxRef.offsetHeight) })
        this.selectColor(newColor)
    }

    onHueSliderMove = (pos) => {
        var hueOffset = this.hueSliderRef.getBoundingClientRect()
        var posY      = this.clamp(pos.y - hueOffset.top, 0, this.hueSliderRef.offsetHeight)

        var newHue = posY / this.hueSliderRef.offsetHeight
        // Don't allow the hue to reach 1. When it's converted to rgb, a hue of one will become zero causing the slider to snap back to the top.
        newHue = newHue >= 1 ? 0.99999999 : newHue

        this.selectColor(this.getSafeSelectedColor().withHsv({ h: newHue }))
    }

    onOpacitySliderMove = (pos) => {
        var opacityOffset = this.opacitySliderRef.getBoundingClientRect()
        var posY = this.clamp(pos.y - opacityOffset.top, 0, this.opacitySliderRef.offsetHeight)

        // Subtract by one to invert the opacity so the slider knob starts at the top
        this.selectColor(this.getSafeSelectedColor().withAlpha(1 - (posY / this.opacitySliderRef.offsetHeight)))
    }

    /* Gets the color that will be returned */
    getReturnColor(color) {
        if (color == null)
            return this.getDefaultColor()

        // Enforce opacity
        if (!this.props.enableOpacity && color.rgb.a != 1)
            color = color.withAlpha(1)

        // Make sure the color is in the swatches
        if (this.props.allowedColors == 'swatches') {
            for (let swatch of this.props.swatches) {
                if (new SimpleColor(swatch).equalTo(color))
                    return color
            }

            return this.getDefaultColor()
        }

        return color
    }

    /** Gets the color string that will returned by the color picker */
    getReturnColorStr(color) {
        var returnColor = this.getReturnColor(color)

        if (returnColor == null)
            return ''

        if (this.props.enableOpacity && returnColor.rgb.a != 1)
            return returnColor.rgbaStr

        return returnColor.hexStr
    }

    /** Returns the selected color making sure it's not null */
    getSafeSelectedColor() {
        return this.state.selectedColor != null ? this.state.selectedColor : new SimpleColor({r: 1, g: 1, b: 1, a: 1})
    }

    /** Returns the default color or null if it's not valid */
    getDefaultColor() {
        var defaultColor = new SimpleColor(this.props.defaultColor)
        return defaultColor.isValid ? defaultColor : null
    }

    /** Gets the x and y pos from the event using the touch or mouse position */
    getClientPosFromEvent(event) {
        // Try to get the mouse position
        if (event.clientX != null && event.clientY != null)
            return { x: event.clientX, y: event.clientY }
        // Try to get the touch position
        else if (event.changedTouches != null && event.changedTouches[0] != null)
            return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }

        return { x: 0, y: 0 }
    }

    handleDrag(event, eventType, callback) {
        const doCallback = (e) => {
            callback(this.getClientPosFromEvent(e))
            e.preventDefault()
        }

        var moveEventName = eventType == 'mouse' ? 'mousemove' : 'touchmove'
        var stopEventName = eventType == 'mouse' ? 'mouseup'   : 'touchend'

        window.addEventListener(moveEventName, doCallback)
        window.addEventListener(stopEventName, function finish() {
            window.removeEventListener(moveEventName, doCallback)
            window.removeEventListener(stopEventName, finish)
        })

        doCallback(event)
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }

    render() {
        var currentColor = this.getReturnColor(this.state.selectedColor)

        if (currentColor == null)
            currentColor = new SimpleColor({r: 1, g: 1, b: 1, a: 0})

        var { hsv, hexStr }   = currentColor
        var hueColor          = new SimpleColor({h: hsv.h, s: 1, v: 1, a: 1}).hexStr
        var { allowedColors } = this.props

        var [hueKnobPosX, hueKnobPosY, hueSliderPos, opacitySliderPos] = Array(4).fill('px')

        // Get the hue knob position
        if (this.hueBoxRef != null && this.hueBoxKnobRef != null) {
            var halfSize = this.hueBoxKnobRef.offsetWidth / 2
            hueKnobPosX = Math.round((this.hueBoxRef.offsetWidth * hsv.s) - halfSize) + 'px'
            hueKnobPosY = Math.round((this.hueBoxRef.offsetHeight * (1 - hsv.v)) - halfSize) + 'px'
        }

        // Get the hue slider knob position
        if (this.hueSliderRef != null && this.hueSliderKnobRef != null) {
            hueSliderPos = Math.round(hsv.h * (this.hueSliderRef.offsetHeight - this.hueSliderKnobRef.offsetHeight)) + 'px'
        }

        // Get the opacity slider knob position
        if (this.opacitySliderRef != null && this.opacitySliderKnobRef != null) {
            opacitySliderPos = Math.round((1 - currentColor.rgb.a) * (this.opacitySliderRef.offsetHeight - this.opacitySliderKnobRef.offsetHeight)) + 'px'
        }

        return (
            <div className="c-colorpicker">
                <input class="c-colorpicker-input" type="text" id={this.props.inputId} name={this.props.inputName} value={this.state.inputValue} onChange={this.onInputChange} onFocus={this.showColorPanel} onBlur={this.hideColorPanel} autoComplete="off"/>
                <span className="c-colorpicker-input-color"><span style={{background: currentColor.rgbaStr}}></span></span>

                <div className="c-colorpicker-panel" style={{display: this.state.showPanel ? 'block' : 'none'}} onMouseDown={e => { e.stopPropagation(); e.preventDefault() }}>
                    { (allowedColors == 'any') &&
                    <div className="c-colorpicker-controls">
                        <div className="c-colorpicker-hue-box" style={{background: hueColor}} onMouseDown={(e) => this.handleDrag(e, 'mouse', this.onHueBoxMove)} onTouchStart={(e) => this.handleDrag(e, 'touch', this.onHueBoxMove)} ref={el => this.hueBoxRef = el}>
                            <div className="c-colorpicker-hue-box-knob" style={{top: hueKnobPosY, left: hueKnobPosX, background: hexStr}}  ref={el => this.hueBoxKnobRef = el}></div>
                        </div>

                        <div className="c-colorpicker-slider c-colorpicker-hue-slider" onMouseDown={e => this.handleDrag(e, 'mouse', this.onHueSliderMove)} onTouchStart={(e) => this.handleDrag(e, 'touch', this.onHueSliderMove)} ref={el => this.hueSliderRef = el}><div className="c-colorpicker-slider-knob" ref={el => this.hueSliderKnobRef = el} style={{background: hueColor, top: hueSliderPos}}></div></div>
                        { this.props.enableOpacity &&
                            <div className="c-colorpicker-slider c-colorpicker-opacity-slider" onMouseDown={e => this.handleDrag(e, 'mouse', this.onOpacitySliderMove)} onTouchStart={(e) => this.handleDrag(e, 'touch', this.onOpacitySliderMove)} ref={el => this.opacitySliderRef = el}><div className="c-colorpicker-slider-knob" ref={el => this.opacitySliderKnobRef = el} style={{background: hexStr, top: opacitySliderPos}}></div><div className="c-colorpicker-slider-inner" style={{background: `linear-gradient(to top, ${currentColor.withAlpha(0).rgbaStr}, ${hexStr})`}}></div></div>
                        }
                    </div>
                    }

                    <div className="c-colorpicker-swatches">
                        {
                            this.props.swatches.map((colorStr, index) => {
                                const color = new SimpleColor(colorStr)

                                if ( !color.isValid ) return '';

                                return (<div key={index} className={`c-colorpicker-swatch ${color.rgbaStr == currentColor.rgbaStr ? 'is-selected' : ''}`} data-color={colorStr} onClick={this.onSwatchClick} style={ {backgroundColor: color.rgbaStr, borderColor: color.shade(-15).rgbaStr} }></div>)
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}



// TODO: The color picker overflows the grid field
