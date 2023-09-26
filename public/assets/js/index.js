;(function () {
  this.renderDelayTimeout = null

  // UI Elements
  this.UI = {
    // Units selector radio buttons
    unitsSelectors: document.querySelectorAll(
      'input[name="hero-bmi-calculator-units"]'
    ),

    // Imperial and metric input wrappers
    inputWrapper: {
      metric: [
        document.querySelector('#metric-height-input-wrapper'),
        document.querySelector('#metric-weight-input-wrapper'),
      ],
      imperial: [
        document.querySelector('#imperial-height-input-wrapper'),
        document.querySelector('#imperial-weight-input-wrapper'),
      ],
    },

    // Height and weight inputs
    input: {
      height: {
        cm: document.querySelector('#hero-bmi-calculator-height-input--cm'),
        ft: document.querySelector('#hero-bmi-calculator-height-input--ft'),
        in: document.querySelector('#hero-bmi-calculator-height-input--in'),
      },
      weight: {
        kg: document.querySelector('#hero-bmi-calculator-weight-input--kg'),
        lb: document.querySelector('#hero-bmi-calculator-weight-input--lb'),
      },
    },

    welcomeMessage: document.querySelector(
      '#hero-bmi-calculator-welcome-message'
    ),
    outputContainer: document.querySelector(
      '#hero-bmi-calculator-results-container'
    ),
    bmiOutput: document.querySelector('#hero-bmi-calculator-results-number'),
    classificationOutput: document.querySelector(
      '#hero-bmi-calculator-results-classification'
    ),
    idealWeightOutput: document.querySelector(
      '#hero-bmi-calculator-results-ideal-weight'
    ),
  }

  // State
  this.user = {
    units: 'metric',
    height: 0,
    weight: 0,
  }

  // Event handlers
  this.setup = function () {
    this.UI.unitsSelectors.forEach(radio => {
      radio.addEventListener('change', this.changeUnits.bind(this))
    })
    Object.keys(this.UI.input.height).forEach(key => {
      this.UI.input.height[key].addEventListener(
        'input',
        this.updateHeight.bind(this)
      )
    })
    Object.keys(this.UI.input.weight).forEach(key => {
      console.log('key', this.UI.input.weight)
      this.UI.input.weight[key].addEventListener(
        'input',
        this.updateWeight.bind(this)
      )
    })
  }

  this.changeUnits = function (e) {
    user.units = e.target.value
    const unselectedUnit = user.units === 'metric' ? 'imperial' : 'metric'

    // Hide the input wrappers for the unselected unit
    this.UI.inputWrapper[unselectedUnit].forEach(wrapper => {
      wrapper.classList.add('hidden')
    })

    // Show the input wrappers for the selected unit
    this.UI.inputWrapper[user.units].forEach(wrapper => {
      wrapper.classList.remove('hidden')
    })

    // Update the input values for the selected unit
    if (user.units === 'metric') {
      this.UI.input.height.cm.value = this.getMetricHeight(
        this.UI.input.height.ft.value,
        this.UI.input.height.in.value
      )
      this.UI.input.weight.kg.value = this.getMetricWeight(
        this.UI.input.weight.lb.value
      )
    } else {
      const imperialHeightObj = this.getImperialHeightObj(
        this.UI.input.height.cm.value
      )
      this.UI.input.height.ft.value = imperialHeightObj.ft
      this.UI.input.height.in.value = imperialHeightObj.in
      this.UI.input.weight.lb.value = this.getImperialWeight(
        this.UI.input.weight.kg.value
      )
    }

    this.render()
  }

  this.updateHeight = function () {
    if (user.units === 'imperial') {
      user.height = this.getMetricHeight(
        this.UI.input.height.ft.value,
        this.UI.input.height.in.value
      )
    } else {
      user.height = this.UI.input.height.cm.value
    }
    this.render()
  }

  this.updateWeight = function () {
    if (user.units === 'imperial') {
      user.weight = this.getMetricWeight(this.UI.input.weight.lb.value)
    } else {
      user.weight = this.UI.input.weight.kg.value
    }
    this.render()
  }

  // Methods
  this.getImperialHeightObj = function (cm) {
    const inches = cm / 2.54
    const feet = Math.floor(inches / 12)
    const remainingInches = Math.round((inches % 12) * 10) / 10
    return {
      ft: feet,
      in: remainingInches,
    }
  }

  this.getImperialHeightInches = function (cm) {
    const inches = Math.round((cm * 10) / 2.54) / 10
    return inches
  }

  this.getImperialWeight = function (kg) {
    const lb = Math.round(kg * 10 * 2.205) / 10
    return lb
  }

  this.getMetricHeight = function (ft, inches) {
    const totalInches = +ft * 12 + +inches
    return Math.round(totalInches * 10 * 2.54) / 10
  }

  this.getMetricWeight = function (lb) {
    return Math.round((lb * 10) / 2.205) / 10
  }

  this.getBMI = function () {
    if (user.height === 0 || user.weight === 0) {
      return 0
    }
    if (user.units === 'metric') {
      return user.weight / (((user.height / 100) * user.height) / 100)
    } else {
      const inches = this.getImperialHeightInches(user.height)
      const lbs = this.getImperialWeight(user.weight)
      return (lbs * 703) / inches ** 2
    }
  }

  this.getHealthyWeightRange = function () {
    if (user.units === 'metric') {
      return {
        min:
          18.5 * (((user.height / 100) * user.height) / 100).toFixed(1) + 'kgs',
        max:
          25 * (((user.height / 100) * user.height) / 100).toFixed(1) + 'kgs',
      }
    } else {
      const inches = this.getImperialHeightInches(user.height)
      return {
        min: 18.5 * (inches ** 2 / 703).toFixed(1) + 'lbs',
        max: 25 * (inches ** 2 / 703).toFixed(1) + 'lbs',
      }
    }
  }

  this.getWeightClassification = function () {
    let bmi = this.getBMI()
    if (bmi < 18.5) {
      return 'Underweight'
    } else if (bmi >= 18.5 && bmi < 25) {
      return 'Normal'
    } else if (bmi >= 25 && bmi < 30) {
      return 'Overweight'
    } else {
      return 'Obese'
    }
  }

  // Render
  this.render = function () {
    this.clearTimeout(this.renderDelayTimeout)
    this.renderDelayTimeout = setTimeout(function () {
      const bmi = this.getBMI()
      if (bmi === 0) {
        this.UI.outputContainer.classList.add('hidden')
        this.UI.welcomeMessage.classList.remove('hidden')

        this.UI.bmiOutput.innerHTML = 'N/A'
        this.UI.classificationOutput.innerHTML = 'N/A'
        this.UI.idealWeightOutput.innerHTML = 'N/A'
        return
      }

      this.UI.outputContainer.classList.remove('hidden')
      this.UI.welcomeMessage.classList.add('hidden')

      const weightClassification = this.getWeightClassification()
      const healthyWeightRange = this.getHealthyWeightRange()
      this.UI.bmiOutput.innerHTML = bmi.toFixed(1)
      this.UI.classificationOutput.innerHTML = weightClassification
      this.UI.idealWeightOutput.innerHTML = `${healthyWeightRange.min} - ${healthyWeightRange.max}`
    }, 500)
  }

  // Initialize
  this.setup()
})()
