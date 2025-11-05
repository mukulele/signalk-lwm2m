# LwM2M Objects

## Object 3: Device

This LwM2M Object provides a range of device related information which can be queried by the LwM2M Server, and a device reboot and factory reset function.

## Object 3201: Digital Output

Generic digital output for non-specific actuators

## Object 3202: Analog Input

Generic analog input for non-specific sensors

## Object 3203: Analog Output

This IPSO object is a generic object that can be used with any kind of analog output interface.

## Object 3300: Generic Sensor

This IPSO object allows the description of a generic sensor. It is based on the description of a value and a unit according to the SenML specification. Thus, any type of value defined within this specification can be reported using this object. This object may be used as a generic object if a dedicated one does not exist.

## Object 3303: Temperature

This IPSO object should be used with a temperature sensor to report a temperature measurement.  It also provides resources for minimum/maximum measured values and the minimum/maximum range that can be measured by the temperature sensor. An example measurement unit is degrees Celsius.

## Object 3311: Light Control

This Object is used to control a light source, such as a LED or other light.  It allows a light to be turned on or off and its dimmer setting to be control as a % between 0 and 100. An optional colour setting enables a string to be used to indicate the desired colour.

## Object 3316: Voltage

This IPSO object should be used with voltmeter sensor to report measured voltage between two points.  It also provides resources for minimum and maximum measured values, as well as the minimum and maximum range that can be measured by the sensor. An example measurement unit is volts.

## Object 3317: Current

This IPSO object should be used with an ammeter to report measured electric current in amperes. It also provides resources for minimum and maximum measured values, as well as the minimum and maximum range that can be measured by the sensor. An example measurement unit is ampere.

## Object 3322: Load

This IPSO object should be used with a load sensor (as in a scale) to report the applied weight or force. It also provides resources for minimum and maximum measured values, as well as the minimum and maximum range that can be measured by the sensor. An example measurement unit is kilograms.

## Object 3323: Pressure

This IPSO object should be used to report pressure measurements. It also provides resources for minimum and maximum measured values, as well as the minimum and maximum range that can be measured by the sensor. An example measurement unit is pascals.

## Object 3328: Power

This IPSO object should be used to report power measurements. It also provides resources for minimum and maximum measured values, as well as the minimum and maximum range that can be measured by the sensor. An example measurement unit is Watts. This object may be used for either real power or apparent power measurements.

## Object 3336: Location

This IPSO object represents GPS coordinates. This object is compatible with the LwM2M management object for location, but uses reusable resources.

## Object 3342: On/Off switch

This IPSO object should be used with an On/Off switch to report the state of the switch.

## Object 3347: Push button

This IPSO object is used to report the state of a momentary action push button control and to count the number of times the control has been operated since the last observation.

## Object 6: Location

This LwM2M Object provides a range of location telemetry related information which can be queried by the LwM2M Server.

