'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initForm = {};

var forms = function forms() {
	var forms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initForm;
	var action = arguments[1];

	var form = null;
	var formName = null;

	var _ret = function () {
		switch (action.type) {

			case 'form/input':
				var _action$payload = action.payload,
				    form = _action$payload.form,
				    input = _action$payload.input;

				formName = form.$name;
				forms[formName][input.name] = input.value;
				return {
					v: Object.assign({}, forms, _defineProperty({}, form.$name, form))
				};

			case 'form/add':

				form = action.payload;
				return {
					v: Object.assign({}, forms, _defineProperty({}, form.$name, form))
				};

			case 'form/update':

				form = action.payload;
				return {
					v: Object.assign({}, forms, _defineProperty({}, form.$name, form))
				};

			case 'form/reset':

				form = action.payload;
				delete forms[form.$name];
				return {
					v: forms
				};

			case 'forms/inputs/add':

				var formsInAction = action.payload;
				var formsMap = formsInAction.reduce(function (acc, curr) {
					var formJson = forms[curr['form']];
					var inputs = curr.inputs;
					inputs.forEach(function (i) {
						formJson[i.$name] = i;
					});
					return _defineProperty({}, curr['form'], formJson);
				}, {});
				return {
					v: Object.assign({}, forms, _extends({}, formsMap))
				};

			case 'forms/remove':

				return {
					v: Object.assign({}, _util2.default.omit(forms, action.payload.map(function (f) {
						return f.form;
					})))
				};

			case 'forms/inputs/remove':

				var objArrToRemove = action.payload;

				var formUpdated = objArrToRemove.map(function (o) {
					return Object.keys(forms).filter(function (formName) {
						return formName === o.form;
					}).map(function (formName) {
						return { inputs: o.inputs, form: forms[formName] };
					})[0];
				}).reduce(function (acc, curr) {
					var key = curr.form.$name;
					var val = _util2.default.omit(curr.form, curr.inputs);
					acc[key] = val;
					return acc;
				}, {});

				return {
					v: Object.assign({}, forms, formUpdated)
				};

			case 'forms/inputs/update':

				var objArrToUpdate = action.payload;

				var inputsMap = objArrToUpdate.inputs.map(function (input) {
					return {
						name: input.$name,
						val: input
					};
				}).reduce(function (acc, curr) {
					acc[curr.name] = curr.val;
					return acc;
				}, {});

				var isDirty = inputsMap[Object.keys(inputsMap)[0]].$dirty;
				var formMeta = Object.assign.apply(Object, [{}].concat(_toConsumableArray(forms[objArrToUpdate.form]), [_extends({
					$dirty: isDirty,
					$pristine: !isDirty
				}, inputsMap)]));

				var isInvalid = function isInvalid() {
					var inputs = _util2.default.extractField(formMeta);
					return Object.keys(inputs).filter(function (i) {
						var errors = inputs[i].$error;
						return Object.keys(errors).length > 0;
					}).length > 0;
				};

				var inputsKeys = Object.keys(inputsMap);

				if (inputsKeys && inputsKeys.length <= 0) {
					formMeta.$invalid = false;
					formMeta.$valid = true;
				} else {
					if (isInvalid()) {
						formMeta.$invalid = true;
						formMeta.$valid = false;
					} else {
						formMeta.$invalid = false;
						formMeta.$valid = true;
					}
				}

				var o = Object.assign({}, _defineProperty({}, objArrToUpdate.form, {}), _defineProperty({}, objArrToUpdate.form, _extends({}, formMeta)));
				return {
					v: Object.assign({}, forms, o)
				};

			case 'form/submit':
				formName = action.payload;

				return {
					v: Object.assign({}, forms, _defineProperty({}, formName, _extends({}, forms[formName], { $submitted: true })))
				};

			case 'form/valid':
				formName = action.payload;

				return {
					v: Object.assign({}, forms, _defineProperty({}, formName, _extends({}, forms[formName], { $invalid: false, $valid: true })))
				};

			case 'form/unsubmit':
				formName = action.payload;

				return {
					v: Object.assign({}, forms, _defineProperty({}, formName, _extends({}, forms[formName], { $submitted: false })))
				};

			default:
				return {
					v: forms
				};
		}
	}();

	if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
};

exports.default = { forms: forms };