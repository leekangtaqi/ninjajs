let validators = {};

let buildinValidators = [
	{
		name: "required",
		fn: function(val){
			return val.trim() === ""
		}
	},
	{
		name: 'max',
		fn: function(val, expected){
			return parseInt(val.trim(), 10) > expected;
		}
	},
	{
		name: 'min',
		fn: function(val, expected){
			return parseInt(val.trim(), 10) < expected;
		}
	},
	{
		name: 'maxlength',
		fn: function(val, expected){
			return val.length > expected;
		}
	},
	{
		name: 'minlength',
		fn: function(val, expected){
			return val.length < expected;
		}
	},
	{
		name: 'pattern',
		fn: function(val, expected){
			return !(new RegExp(expected)).test(val.trim());
		}
	}
];

/**
 * register build-in validators
 */
buildinValidators.map(validator => {
	registerValidators(validator.name, validator.fn);
});

function registerValidators(name, fn){

	if (!name || typeof name != 'string') {
		throw new Error(`invalid validator name [name]=${name}`)
	}

	if (!fn || typeof fn != 'function') {
		throw new Error(`invalid validator name [fn]=${fn}`)
	}
	
	validators[name] = fn;
}

export { validators, registerValidators }