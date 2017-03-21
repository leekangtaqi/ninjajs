'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.default = Form;

var _provider = require('../riot-redux/components/provider');

var _validator = require('./validator');

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * HOC: 
 * opts: forms, submit
 */
function Form(inputRulePairs) {
	return function wrapComponent(WrappedComponent) {
		return function (_WrappedComponent) {
			_inherits(Form, _WrappedComponent);

			function Form() {
				_classCallCheck(this, Form);

				return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
			}

			_createClass(Form, [{
				key: 'onCreate',
				value: function onCreate(opts) {
					_get(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), 'onCreate', this).call(this, opts);
					this.options = inputRulePairs;
					this.on('updated', this.onUpdated);
					this.mapDispatchToOpts();
				}

				/**
     * del all forms and inputs.
     * unbind any event listener and reflush redux store.
     * trigger onUpdated event, init the whole forms.
     */

			}, {
				key: 'resetForm',
				value: function resetForm() {
					var _this2 = this;

					var formsToRemove = [];
					this.extractFormNamesFromRef().forEach(function (formName) {
						_this2.delForm(formName);
						formsToRemove.push({ form: formName });
					});
					var store = this.getStore();
					store.dispatch({ type: 'forms/remove', payload: formsToRemove });
				}

				/**
     * @param inputNames <Array>
     */

			}, {
				key: 'resetInputs',
				value: function resetInputs(inputNames) {
					var _this3 = this;

					inputNames.forEach(function (inputName) {
						return _this3.resetInput(inputName);
					});
				}

				/**
     * @param inputName <String>
     * @param val <String>
     */

			}, {
				key: 'setRef',
				value: function setRef(inputName) {
					var val = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

					if (!inputName) {
						var err = new Error('set ref method expecta input name');
						throw err;
					}
					this.refs[inputName].value = val;
					triggerEvent(this.refs[inputName], 'change');
					function triggerEvent(el, type) {
						if ('createEvent' in document) {
							// modern browsers, IE9+
							var e = document.createEvent('HTMLEvents');
							e.initEvent(type, false, true);
							el.dispatchEvent(e);
						} else {
							// IE 8
							var e = document.createEventObject();
							e.eventType = type;
							el.fireEvent('on' + e.eventType, e);
						}
					}
				}

				/**
     * unbind change listener, remove handler from this.$form
     * remove input of store
     * @param inputName <String>
     */

			}, {
				key: 'resetInput',
				value: function resetInput(inputName) {
					if (!inputName) {
						var err = new Error('[redux-form]: reset input expect a inputName');
						throw err;
					}
					if (!this.refs[inputName] || !this.refs[inputName].form || !this.refs[inputName].form.getAttribute('ref')) {
						return;
					}
					var formName = this.refs[inputName].form.getAttribute('ref');
					this.delInput(inputName, formName);
				}
			}, {
				key: 'mapDispatchToOpts',
				value: function mapDispatchToOpts() {
					var _this4 = this;

					var store = this.getStore();
					this.opts.submit = function (formName) {
						if (!_this4.refs[formName]) {
							console.warn('failed to submit the form, can not find the form [name]' + formName);
						}
						var forms = _this4.extractFormNamesFromRef().map(function (fn) {
							return _this4.refs[fn];
						});
						forms.forEach(function (f) {
							var inputs = _this4.extractInputsFromForm(f).map(function (inp) {
								return _this4.refs[inp];
							});
							inputs.forEach(function (input) {
								_this4.validate(input, input.value);
							});
							if (!inputs || !inputs.length) {
								store.dispatch({ type: 'form/valid', payload: formName });
							}
						});

						store.dispatch({ type: 'form/submit', payload: formName });
					};
					this.opts.unsubmit = function (formName) {
						if (!_this4.refs[formName]) {
							console.warn('failed to unsubmit the form, can not find the form [name]' + formName);
						}
						store.dispatch({ type: 'form/unsubmit', payload: formName });
					};
				}
			}, {
				key: 'unMapDispatchToOpts',
				value: function unMapDispatchToOpts() {

					delete this.opts['forms'];
					delete this.opts['submit'];
				}

				/**
     * listen input change dispatch to store, and do validating.
     * when updated, check input modify or not, if it is, set rule again.
     */

			}, {
				key: 'onUpdated',
				value: function onUpdated() {

					var store = this.getStore();

					if (!this.refs) {
						return;
					}
					var formNames = this.extractFormNamesFromRef();
					if (!formNames || !formNames.length) {
						return;
					}
					// the forms struct changed ?
					this.refDiff(this.extractFormsFromRef());

					// rebind or not
					this.rebindInputs();
				}
			}, {
				key: 'rebindInputs',
				value: function rebindInputs() {
					for (var inputName in this.refs) {
						var handler = this.findHandlerInFormHandlersByInputName(inputName);
						var input = this.refs[inputName];
						if (handler && handler.input != input) {
							handler.input = input;
							input.addEventListener('change', handler.bind(this));
						}
					}
				}
			}, {
				key: 'findHandlerInFormHandlersByInputName',
				value: function findHandlerInFormHandlersByInputName(inputName) {
					if (!this.$form || !this.$form.handlers) {
						return;
					}
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = this.$form.handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var handler = _step.value;

							if (handler.input.getAttribute('ref') === inputName) {
								return handler;
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				}
			}, {
				key: 'extractFormNamesFromRef',
				value: function extractFormNamesFromRef() {
					var _this5 = this;

					return Object.keys(this.refs).filter(function (r) {
						return _this5.refs[r].nodeName === 'FORM';
					});
				}
			}, {
				key: 'extractFormsFromRef',
				value: function extractFormsFromRef() {
					var _this6 = this;

					return this.extractFormNamesFromRef().map(function (n) {
						return _this6.refs[n];
					});
				}
			}, {
				key: 'extractInputsNames',
				value: function extractInputsNames() {
					var _this7 = this;

					return Object.keys(this.refs).filter(function (r) {
						return _this7.refs[r].nodeName === ('INPUT' || 'SELECT');
					});
				}
			}, {
				key: 'extractInputsFromRefs',
				value: function extractInputsFromRefs() {
					var _this8 = this;

					return Object.keys(this.refs).filter(function (r) {
						return _this8.refs[r].nodeName === ('INPUT' || 'SELECT');
					}).map(function (f) {
						return _this8.refs[f];
					});
				}
			}, {
				key: 'extractInputsFromForm',
				value: function extractInputsFromForm(form) {
					var _this9 = this;

					return Object.keys(this.refs).filter(function (r) {
						return _this9.refs[r].form === form;
					});
				}
			}, {
				key: 'getStore',
				value: function getStore() {
					return (0, _provider.getProvider)(this).opts.store;
				}
			}, {
				key: 'getInputs',
				value: function getInputs(form) {
					var _this10 = this;

					return Object.keys(this.refs).filter(function (r) {
						return _this10.refs[r].form === form;
					}).map(function (k) {
						return _this10.refs[k];
					});
				}
			}, {
				key: 'refDiff',
				value: function refDiff(forms) {
					var _this11 = this;

					var store = this.getStore();
					var formsInStore = store.getState().forms;

					var _distinctForm = this.distinctForm(forms, formsInStore, function (f) {
						return f.attributes["ref"].value;
					}),
					    adds = _distinctForm.adds,
					    dels = _distinctForm.dels;

					var remainForms = this.extractFormNamesFromRef().filter(function (formName) {
						return adds.indexOf(formName) < 0 && dels.indexOf() < 0;
					});

					// resolve adds
					if (adds && adds.length) {
						var formsToUpdate = [];

						adds.forEach(function (f) {
							_this11.addForm(store, f);
							var inputs = _this11.getInputs(_this11.refs[f]);
							var inputsToUpdate = inputs.map(function (input) {
								return _this11.addInput(store, input, f);
							});
							formsToUpdate.push({ form: f, inputs: inputsToUpdate });
						});

						formsToUpdate.length && store.dispatch({ type: 'forms/inputs/add', payload: formsToUpdate });
					}

					// resolve dels remove all listen handlers
					if (dels && dels.length) {
						var formsToRemove = [];

						dels.forEach(function (f) {
							_this11.delForm(store, f);
							formsToRemove.push({ form: f });
						});

						store.dispatch({ type: 'forms/remove', payload: formsToRemove });
					}

					// extract not add and del form, check input struct
					if (remainForms && remainForms.length) {
						var _resolveInputsInFormL = this.resolveInputsInFormLoop(remainForms),
						    _adds = _resolveInputsInFormL.adds,
						    _dels = _resolveInputsInFormL.dels;

						if (_adds && _adds.length) {
							var _formsToUpdate = [];

							_adds.forEach(function (_ref) {
								var formName = _ref.formName,
								    inputs = _ref.inputs;

								if (inputs && inputs.length) {
									var inputsToUpdate = inputs.map(function (input) {
										return _this11.addInput(store, _this11.refs[input], formName);
									});
									_formsToUpdate.push({ form: formName, inputs: inputsToUpdate });
								}
							});
							_formsToUpdate.length && store.dispatch({ type: 'forms/inputs/add', payload: _formsToUpdate });
						}

						if (_dels && _dels.length) {
							var _formsToRemove = [];

							_dels.forEach(function (formName, inputs) {
								if (inputs && inputs.length) {
									inputs.forEach(function (inputName) {
										_this11.refs[inputName].forEach(function (input) {
											return _this11.delInput(input);
										});
									});

									_formsToRemove.push({ form: formName, inputs: inputs });
								}
							});
							_formsToRemove.length && store.dispatch({ type: 'forms/inputs/remove', payload: _formsToRemove });
						}
					}
				}
			}, {
				key: 'distinctForm',
				value: function distinctForm(curr, allPrev, fn) {
					var _this12 = this;

					var prev = Object.keys(allPrev).filter(function (p) {
						return allPrev[p].$meta._riot_id === _this12._riot_id;
					}).map(function (k) {
						return allPrev[k];
					});
					var prevFormNames = prev.map(function (p) {
						return p.$name;
					});
					var adds = [];
					var dels = [];

					for (var i = 0, len = curr.length; i < len; i++) {
						var form = curr[i];
						var index = prevFormNames.indexOf(fn(form));
						if (index >= 0) {
							prevFormNames.splice(index, 1);
							continue;
						} else {
							adds.push(fn(form));
						}
					}
					prevFormNames.length && (dels = prevFormNames);

					return { adds: adds, dels: dels };
				}
			}, {
				key: 'distinctInput',
				value: function distinctInput(curr, allPrev, fn) {
					var adds = [];
					var dels = [];
					var prevs = _util2.default.clone(allPrev);

					for (var i = 0, len = curr.length; i < len; i++) {
						var inputName = curr[i];
						var inputEl = this.refs[inputName];
						var index = prevs.indexOf(fn(inputEl));
						if (index >= 0) {
							prevs.splice(index, 1);
							continue;
						} else {
							adds.push(fn(inputEl));
						}
					}
					prevs.length && (dels = prevs);

					return { adds: adds, dels: dels };
				}
			}, {
				key: 'bindInputChange',
				value: function bindInputChange(input) {
					var _this13 = this;

					if (!this.$form) {
						this.$form = { handlers: [] };
					}
					var handler = function handler(e) {
						var val = e.target.value;
						_this13.validate(input, val);
					};
					handler.input = input;
					this.$form.handlers.push(handler);
					input.addEventListener('change', handler.bind(this));
				}

				/**
     * @param input <Element>
     * @return <null>
     */

			}, {
				key: 'unbindInputChange',
				value: function unbindInputChange(input) {
					if (!this.$form.handlers.length) {
						return;
					}
					var handlers = this.$form.handlers.filter(function (h) {
						return h.input === input;
					});
					this.$form.handlers = this.$form.handlers.filter(function (h) {
						return h.input != input;
					});
					if (handlers.length) {
						handlers.forEach(function (h, i) {
							input.removeEventListener('change', h);
						});
					}
				}

				/**
     * @param input <Element>
     * @param val <String> value to validate
     */

			}, {
				key: 'validate',
				value: function validate(input, val) {
					var _this14 = this;

					var store = this.getStore();
					var formName = input.form.getAttribute('ref');
					var form = store.getState().forms[formName];
					var inputJson = form[input.getAttribute('ref')];
					var rules = inputJson.$rule;
					var inputsToUpdate = [];

					Object.keys(rules).map(function (ruleName) {
						var validVal = rules[ruleName];
						var validator = _validator.validators[ruleName];
						var invalid = validator(val, rules[ruleName]);
						var inputToUpdate = null;

						if (!invalid) {
							inputToUpdate = _this14.inputValid(input, inputJson, ruleName, val);
						} else {
							inputToUpdate = _this14.inputInvalid(input, inputJson, ruleName, val);
						}

						inputToUpdate.$val = val;

						_this14.resolveClass(inputJson, input);

						inputsToUpdate.push(inputToUpdate);
					});

					store.dispatch({ type: 'forms/inputs/update', payload: { form: formName, inputs: inputsToUpdate } });
				}
			}, {
				key: 'resolveInputsInFormLoop',
				value: function resolveInputsInFormLoop(formsNames) {
					var _this15 = this;

					var store = this.getStore();
					var formsInStore = store.getState().forms;
					var finalAdds = [];
					var finalDels = [];

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						var _loop = function _loop() {
							var formName = _step2.value;

							var inputObjMap = _util2.default.extractField(formsInStore[formName]);
							var inputObjArr = Object.keys(inputObjMap).map(function (k) {
								return inputObjMap[k].$name;
							});

							var _distinctInput = _this15.distinctInput(_this15.extractInputsFromForm(_this15.refs[formName]), inputObjArr, function (i) {
								return i.attributes["ref"].value;
							}),
							    adds = _distinctInput.adds,
							    dels = _distinctInput.dels;

							finalAdds = finalAdds.concat({ formName: formName, inputs: adds });
							finalDels = finalDels.concat({ formName: formName, inputs: dels });
						};

						for (var _iterator2 = formsNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							_loop();
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					return { adds: finalAdds, dels: finalDels };
				}
			}, {
				key: 'inputValid',
				value: function inputValid(inputEl, inputJson, ruleName, val) {
					inputJson.$valid = true;
					inputJson.$invalid = false;
					if (inputJson.$error[ruleName]) {
						delete inputJson.$error[ruleName];
					}

					if (val != inputJson.$originVal) {
						inputJson.$dirty = true;
					} else {
						inputJson.$dirty = false;
					}
					inputJson.$pristine = !inputJson.$dirty;
					return inputJson;
				}
			}, {
				key: 'inputInvalid',
				value: function inputInvalid(inputEl, inputJson, ruleName, val) {
					inputJson.$valid = false;
					inputJson.$invalid = true;
					inputJson.$error[ruleName] = true;

					if (val != inputJson.$originVal) {
						inputJson.$dirty = true;
					} else {
						inputJson.$dirty = false;
					}
					inputJson.$pristine = !inputJson.$dirty;
					return inputJson;
				}
			}, {
				key: 'resolveClass',
				value: function resolveClass(field, input) {
					if (Object.keys(field.$error).length > 0) {
						_util2.default.removeClass(input, 'f-valid');
						_util2.default.addClass(input, 'f-invalid');
					} else {
						_util2.default.removeClass(input, 'f-invalid');
						_util2.default.addClass(input, 'f-valid');
					}
					if (field.$dirty) {
						_util2.default.addClass(input, 'f-dirty');
						_util2.default.removeClass(input, 'f-pristine');
					}
					if (field.$pristine) {
						_util2.default.addClass(input, 'f-pristine');
						_util2.default.removeClass(input, 'f-dirty');
					}
				}

				/**
     * @param store <Object>
     * @param input <Element>
     * @param formName <String>
     */

			}, {
				key: 'addInput',
				value: function addInput(store, input, formName) {
					var _this16 = this;

					var inputName = this.getInputName(input);
					var rulesMap = this.options[inputName];
					var rules = Object.keys(rulesMap).map(function (k) {
						return { name: k, value: rulesMap[k] };
					});
					var inputInstance = this.getInputInstance(input, formName);
					rules.map(function (r) {
						return _this16.addInputRule(inputInstance, r);
					});
					this.bindInputChange(input);
					return inputInstance;
				}
			}, {
				key: 'addInputRule',
				value: function addInputRule(input, rule) {
					input.$rule[rule.name] = rule.value;
					return input;
				}
			}, {
				key: 'getInputName',
				value: function getInputName(input) {
					return input.attributes['ref'].value;
				}
			}, {
				key: 'getInputInstance',
				value: function getInputInstance(input, formName) {
					var inputPersisted = null;
					var inputName = this.getInputName(input);
					var state = this.getStore().getState();
					var formInStore = state.forms[formName];
					inputPersisted = formInStore[inputName];
					if (!inputPersisted) {
						inputPersisted = {
							$name: inputName,
							$dirty: false,
							$pristine: true,
							$valid: true,
							$invalid: false,
							$error: {},
							$rule: {},
							$originVal: input.value
						};
					}
					return inputPersisted;
				}
			}, {
				key: 'delInput',
				value: function delInput(inputName, formName) {
					var formsToRemove = [];
					var store = this.getStore();
					var inputEl = this.refs[inputName];
					inputEl.value = "";
					this.unbindInputChange(inputEl);
					formsToRemove.push({ form: formName, inputs: [inputName] });
					store.dispatch({ type: 'forms/inputs/remove', payload: formsToRemove });
				}
			}, {
				key: 'addForm',
				value: function addForm(store, formName) {
					var validated = false;
					var form = {
						$meta: {
							_riot_id: this._riot_id
						},
						$name: formName,
						$dirty: false,
						$pristine: true,
						$valid: false,
						$invalid: true,
						$submitted: false,
						$error: {}
					};

					store.dispatch({ type: 'form/add', payload: form });
				}
			}, {
				key: 'delForm',
				value: function delForm(formName) {
					var _this17 = this;

					this.extractInputsFromForm(this.refs[formName]).map(function (n) {
						return _this17.refs[n];
					}).forEach(function (input) {
						input.value = '';
						_this17.unbindInputChange(input);
					});
				}
			}, {
				key: 'trySubscribe',
				value: function trySubscribe() {
					var _this18 = this;

					_get(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), 'trySubscribe', this).call(this);
					var store = this.getStore();
					this.subscribe = store.subscribe(function () {
						var state = store.getState();
						var lastAction = state.lastAction;
						if (lastAction.type === 'forms/add' || lastAction.type === 'forms/inputs/add' || lastAction.type === 'forms/inputs/update' && _this18.extractFormNamesFromRef().indexOf(lastAction.payload.form) >= 0 || lastAction.type === 'form/submit' && _this18.extractFormNamesFromRef().indexOf(lastAction.payload) >= 0 || _this18.concernActions(lastAction.type, lastAction.payload)) {
							if (_this18.isMounted) {
								_this18.opts.forms = state.forms;
								_this18.update();
							}
						}
					});
				}
			}, {
				key: 'concernActions',
				value: function concernActions(type, payload) {
					var formNames = this.extractFormNamesFromRef();
					if (type === 'forms/remove') {
						if (formNames && formNames.length) {
							var intersection = _util2.default.intersect(formNames, payload.map(function (p) {
								return p.form;
							}));
							return intersection.length > 0;
						}
					}
					if (type === 'forms/inputs/remove') {
						var inputNames = payload.map(function (s) {
							return s.inputs;
						}).reduce(function (acc, curr) {
							return acc.concat(curr);
						}, []);
						if (inputNames) {
							return _util2.default.intersect(inputNames, Object.keys(this.refs)).length > 0;
						}
					}
					return false;
				}
			}, {
				key: 'unSubscribe',
				value: function unSubscribe() {
					_get(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), 'unSubscribe', this).call(this);
					if (this.subscribe) {
						this.subscribe();
						return true;
					} else {
						return false;
					}
				}
			}, {
				key: 'name',
				get: function get() {
					return 'form-' + (_get(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), 'name', this) || WrappedComponent.name);
				}
			}]);

			return Form;
		}(WrappedComponent);
	};
}