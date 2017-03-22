import { getProvider } from '../riot-redux/components/provider';
import { validators } from './validator';
import _ from '../util';

/**
 * HOC: 
 * opts: forms, submit
 */
export default function Form(inputRulePairs) {
	return function wrapComponent (WrappedComponent) {
		return class Form extends WrappedComponent {
			get name() {
				return 'form-' + (super.name || WrappedComponent.name).toLowerCase();
			}
			onCreate(opts) {
				super.onCreate(opts);
				this.options = inputRulePairs;
				this.on('updated', this.onUpdated);
				this.mapDispatchToOpts();
			}

			/**
			 * del all forms and inputs.
			 * unbind any event listener and reflush redux store.
			 * trigger onUpdated event, init the whole forms.
			 */
			resetForm() {
				let formsToRemove = []
				this.extractFormNamesFromRef().forEach(formName => {
					this.delForm(formName)
					formsToRemove.push({form: formName})
				})
				let store = this.getStore();
				store.dispatch({type: 'forms/remove', payload: formsToRemove});
			}

			/**
			 * @param inputNames <Array>
			 */
			resetInputs(inputNames) {
				inputNames.forEach(inputName => this.resetInput(inputName));
			}

			/**
			 * @param inputName <String>
			 * @param val <String>
			 */
			setRef(inputName, val='') {
				if (!inputName) {
					let err = new Error(`set ref method expecta input name`);
					throw err;
				}
				this.refs[inputName].value = val;
				triggerEvent(this.refs[inputName], 'change')
				function triggerEvent(el, type){
					if ('createEvent' in document) {
						// modern browsers, IE9+
						var e = document.createEvent('HTMLEvents');
						e.initEvent(type, false, true);
						el.dispatchEvent(e);
					} else {
						// IE 8
						var e = document.createEventObject();
						e.eventType = type;
						el.fireEvent('on'+e.eventType, e);
					}
				}
			}

			/**
			 * unbind change listener, remove handler from this.$form
			 * remove input of store
			 * @param inputName <String>
			 */
			resetInput(inputName) {
				if (!inputName) {
					let err = new Error(`[redux-form]: reset input expect a inputName`);
					throw err;
				}
				if (!this.refs[inputName] || 
					!this.refs[inputName].form || 
					!this.refs[inputName].form.getAttribute('ref')
				) {
					return;
				}
				let formName = this.refs[inputName].form.getAttribute('ref');
				this.delInput(inputName, formName);
			}

			mapDispatchToOpts() {
				let store = this.getStore();
				this.opts.submit = formName => {
					if (!this.refs[formName]) {
						console.warn(`failed to submit the form, can not find the form [name]${formName}`)
					}
					let forms = this.extractFormNamesFromRef().map(fn => this.refs[fn])
					forms.forEach(f => {
						let inputs = this.extractInputsFromForm(f).map(inp => this.refs[inp]);
						inputs.forEach(input => {
							this.validate(input, input.value)
						})
						if (!inputs || !inputs.length) {
							store.dispatch({type: 'form/valid', payload: formName})		
						}
					})
					
					store.dispatch({type: 'form/submit', payload: formName})
				}
				this.opts.unsubmit = formName => {
					if (!this.refs[formName]) {
						console.warn(`failed to unsubmit the form, can not find the form [name]${formName}`)
					}
					store.dispatch({type: 'form/unsubmit', payload: formName})
				}
			}

			unMapDispatchToOpts() {

				delete this.opts['forms']
				delete this.opts['submit']
			}

			/**
			 * listen input change dispatch to store, and do validating.
			 * when updated, check input modify or not, if it is, set rule again.
			 */
			onUpdated() {
				
				let store = this.getStore();
			
				if (!this.refs) {
					return;
				}
				let formNames  = this.extractFormNamesFromRef();
				if (!formNames || !formNames.length) {
					return;
				}
				// the forms struct changed ?
				this.refDiff(this.extractFormsFromRef());
				
				// rebind or not
				this.rebindInputs();
			}

			rebindInputs() {
				for (let inputName in this.refs) {
					let handler = this.findHandlerInFormHandlersByInputName(inputName);
					let input = this.refs[inputName]
					if (handler && handler.input != input) {
						handler.input = input
						input.addEventListener('change', handler.bind(this))
					}
				}
			}

			findHandlerInFormHandlersByInputName(inputName) {
				if (!this.$form || !this.$form.handlers) {
					return;
				}
				for (let handler of this.$form.handlers) {
					if (handler.input.getAttribute('ref') === inputName) {
						return handler;
					}
				}
			}

			extractFormNamesFromRef() {
				return Object.keys(this.refs).filter(r => this.refs[r].nodeName === 'FORM')
			}

			extractFormsFromRef() {
				return this.extractFormNamesFromRef().map(n => this.refs[n])
			}

			extractInputsNames() {
				return Object.keys(this.refs).filter(r => this.refs[r].nodeName === ('INPUT' || 'SELECT'))
			}

			extractInputsFromRefs() {
				return Object.keys(this.refs).filter(r => this.refs[r].nodeName === ('INPUT' || 'SELECT')).map(f => this.refs[f])
			}

			extractInputsFromForm(form) {
				return Object.keys(this.refs).filter(r => this.refs[r].form === form)
			}

			getStore() {
				return getProvider(this).opts.store;
			}

			getInputs(form) {
				return Object.keys(this.refs).filter(r => this.refs[r].form === form).map(k => this.refs[k])
			}

			refDiff(forms) {
				let store = this.getStore();
				let formsInStore = store.getState().forms;
				let { adds, dels } = this.distinctForm(forms, formsInStore, f =>  f.attributes["ref"].value);
				let remainForms = this.extractFormNamesFromRef().filter(formName => adds.indexOf(formName) < 0 && dels.indexOf() < 0);

				// resolve adds
				if (adds && adds.length) {
					let formsToUpdate = [];

					adds.forEach(f => {
						this.addForm(store, f)
						let inputs = this.getInputs(this.refs[f])
						let inputsToUpdate = inputs.map(input => this.addInput(store, input, f));
						formsToUpdate.push({ form: f, inputs: inputsToUpdate })
					})
					
					formsToUpdate.length && store.dispatch({type: 'forms/inputs/add', payload: formsToUpdate});
				}

				// resolve dels remove all listen handlers
				if (dels && dels.length) {
					let formsToRemove = [];

					dels.forEach(f => {
						this.delForm(store, f)
						formsToRemove.push({ form: f })
					})

					store.dispatch({type: 'forms/remove', payload: formsToRemove});
				}

				// extract not add and del form, check input struct
				if (remainForms && remainForms.length) {
					let { adds, dels } = this.resolveInputsInFormLoop(remainForms);

					if (adds && adds.length) {
						let formsToUpdate = [];

						adds.forEach(({formName, inputs}) => {
							if (inputs && inputs.length) {
								let inputsToUpdate = inputs.map(input => this.addInput(store, this.refs[input], formName));
								formsToUpdate.push({ form: formName, inputs: inputsToUpdate })
							}
						})
						formsToUpdate.length && store.dispatch({type: 'forms/inputs/add', payload: formsToUpdate});
					}

					if (dels && dels.length) {
						let formsToRemove = [];

						dels.forEach((formName, inputs) => {
							if (inputs && inputs.length) {
								inputs.forEach(inputName => {
									this.refs[inputName].forEach(input => this.delInput(input));
								})
								
								formsToRemove.push({ form: formName,  inputs})
							}
						})
						formsToRemove.length && store.dispatch({type: 'forms/inputs/remove', payload: formsToRemove});
					}
					
				}
			}

			distinctForm(curr, allPrev, fn) {
				let prev  = Object.keys(allPrev).filter(p => allPrev[p].$meta._riot_id === this._riot_id).map(k => allPrev[k])
				let prevFormNames = prev.map(p => p.$name);
				let adds = [];
				let dels = [];

				for (let i=0, len=curr.length; i<len; i++) {
					let form = curr[i];
					let index = prevFormNames.indexOf(fn(form));
					if (index >= 0) {
						prevFormNames.splice(index, 1)
						continue;
					} else {
						adds.push(fn(form))
					}
				}
				prevFormNames.length && ( dels = prevFormNames )

				return { adds, dels }
			}

			distinctInput(curr, allPrev, fn) {
				let adds = [];
				let dels = [];
				let prevs = _.clone(allPrev);

				for (let i=0, len=curr.length; i<len; i++) {
					let inputName = curr[i];
					let inputEl = this.refs[inputName]
					let index = prevs.indexOf(fn(inputEl));
					if (index >= 0) {
						prevs.splice(index, 1)
						continue;
					} else {
						adds.push(fn(inputEl))
					}
				}
				prevs.length && ( dels = prevs )

				return { adds, dels }
			}

			bindInputChange(input) {
				if (!this.$form) {
					this.$form = {handlers: []};
				}
				let handler = e => {
					let val = e.target.value;
					this.validate(input, val)
				}
				handler.input = input;
				this.$form.handlers.push(handler);
				input.addEventListener('change', handler.bind(this))
			}

			/**
			 * @param input <Element>
			 * @return <null>
			 */
			unbindInputChange(input) {
				if (!this.$form.handlers.length) {
					return;
				}
				let handlers = this.$form.handlers.filter(h => h.input === input);
				this.$form.handlers = this.$form.handlers.filter(h => h.input != input);
				if (handlers.length) {
					handlers.forEach((h, i) => {
						input.removeEventListener('change', h);
					})
				}
			}

			/**
			 * @param input <Element>
			 * @param val <String> value to validate
			 */
			validate(input, val) {
				let store = this.getStore()
				let formName = input.form.getAttribute('ref');
				let form = store.getState().forms[formName];
				let inputJson = form[input.getAttribute('ref')];
				let rules = inputJson.$rule;
				let inputsToUpdate = [];

				Object.keys(rules).map(ruleName => {
					let validVal = rules[ruleName];
					let validator = validators[ruleName]
					let invalid = validator(val, rules[ruleName])
					let inputToUpdate = null;
					
					if (!invalid) {
						inputToUpdate = this.inputValid(input, inputJson, ruleName, val)
					} else {
						inputToUpdate = this.inputInvalid(input, inputJson, ruleName, val)
					}

					inputToUpdate.$val = val;

					this.resolveClass(inputJson, input)
					
					inputsToUpdate.push(inputToUpdate);
				})
				
				store.dispatch({type: 'forms/inputs/update', payload: {form: formName, inputs: inputsToUpdate}})
			}

			resolveInputsInFormLoop(formsNames) {
				let store = this.getStore();
				let formsInStore = store.getState().forms;
				let finalAdds = [];
				let finalDels = [];

				for (let formName of formsNames) {
					let inputObjMap = _.extractField(formsInStore[formName]);
					let inputObjArr = Object.keys(inputObjMap).map(k => inputObjMap[k].$name);
					let { adds, dels } = this.distinctInput(this.extractInputsFromForm(this.refs[formName]), inputObjArr, i =>  i.attributes["ref"].value)
					finalAdds = finalAdds.concat({ formName, inputs: adds });
					finalDels = finalDels.concat({ formName, inputs: dels });
				}

				return { adds: finalAdds, dels: finalDels }
			}

			inputValid(inputEl, inputJson, ruleName, val) {
				inputJson.$valid = true;
				inputJson.$invalid = false;
				if (inputJson.$error[ruleName]) {
					delete inputJson.$error[ruleName]
				}
				
				if (val != inputJson.$originVal) {
					inputJson.$dirty = true;
				} else {
					inputJson.$dirty = false;
				}
				inputJson.$pristine = !inputJson.$dirty;
				return inputJson;
			}

			inputInvalid(inputEl, inputJson, ruleName, val) {
				inputJson.$valid = false;
				inputJson.$invalid = true;
				inputJson.$error[ruleName] = true
				
				if (val != inputJson.$originVal) {
					inputJson.$dirty = true;
				} else {
					inputJson.$dirty = false;
				}
				inputJson.$pristine = !inputJson.$dirty;
				return inputJson;
			}

			resolveClass(field, input) {
				if(Object.keys(field.$error).length > 0){
					_.removeClass(input, 'f-valid');
					_.addClass(input, 'f-invalid');
				}else{
					_.removeClass(input, 'f-invalid');
					_.addClass(input, 'f-valid');
				}
				if(field.$dirty) {
					_.addClass(input, 'f-dirty');
					_.removeClass(input, 'f-pristine');
				}
				if(field.$pristine){
					_.addClass(input, 'f-pristine');
					_.removeClass(input, 'f-dirty');
				}
			}

			/**
			 * @param store <Object>
			 * @param input <Element>
			 * @param formName <String>
			 */
			addInput(store, input, formName) {
				let inputName = this.getInputName(input);
				let rulesMap = this.options[inputName];
				let rules = Object.keys(rulesMap).map(k => ({name: k, value: rulesMap[k]}));
				let inputInstance = this.getInputInstance(input, formName);
				rules.map(r => this.addInputRule(inputInstance, r))
				this.bindInputChange(input);
				return inputInstance
			}

			addInputRule(input, rule) {
				input.$rule[rule.name] = rule.value;
				return input;
			}

			getInputName(input) {
				return input.attributes['ref'].value;
			}

			getInputInstance(input, formName) {
				let inputPersisted = null;
				let inputName = this.getInputName(input);
				let state = this.getStore().getState();
				let formInStore = state.forms[formName];
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

			delInput(inputName, formName) {
				let formsToRemove = [];
				let store = this.getStore();
				let inputEl = this.refs[inputName];
				inputEl.value = ""
				this.unbindInputChange(inputEl)
				formsToRemove.push({ form: formName,  inputs: [inputName]})
				store.dispatch({type: 'forms/inputs/remove', payload: formsToRemove});
			}

			addForm(store, formName) {
				let validated = false;
				let form = {
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
				
				store.dispatch({type: 'form/add', payload: form});
			}

			delForm(formName) {
				this.extractInputsFromForm(this.refs[formName])
					.map(n => this.refs[n])
					.forEach(input => {
						input.value = ''
						this.unbindInputChange(input)
					})
			}

			trySubscribe() {
				super.trySubscribe()
				let store = this.getStore();
				this.subscribe = store.subscribe(() => {
					let state =  store.getState();
					let lastAction = state.lastAction
					if (
						(lastAction.type === 'forms/add') ||
						(lastAction.type === 'forms/inputs/add') ||
						(lastAction.type === 'forms/inputs/update' && 
						this.extractFormNamesFromRef().indexOf(lastAction.payload.form) >= 0) ||
						(lastAction.type === 'form/submit' && 
						this.extractFormNamesFromRef().indexOf(lastAction.payload) >= 0) ||
						this.concernActions(lastAction.type, lastAction.payload)
					) {
						if (this.isMounted) {
							this.opts.forms = state.forms
							this.update();
						}
					}
				})
			}

			concernActions(type, payload) {
				let formNames = this.extractFormNamesFromRef();
				if (type === 'forms/remove') {
					if (formNames && formNames.length) {
						let intersection =  _.intersect(formNames, payload.map(p => p.form))
						return intersection.length > 0;
					}
				}
				if (type === 'forms/inputs/remove') {
					let inputNames = payload.map(s => s.inputs).reduce((acc, curr) => acc.concat(curr), []);
					if (inputNames) {
						return _.intersect(inputNames, Object.keys(this.refs)).length > 0
					}
				}
				return false;
			}

			unSubscribe() {
				super.unSubscribe()
				if(this.subscribe) {
					this.subscribe()
					return true;
				}
				else {
					return false;
				}
			}

		} 
	}
}