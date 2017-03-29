import _ from '../util';

const initForm = {}

const forms = (forms = initForm , action) => {
	let form = null;
	let formName = null;
	switch (action.type) {

		case 'form/input':

			let {form, input} = action.payload;
			formName = form.$name;
			forms[formName][input.name] = input.value;
			return Object.assign({}, forms, {[form.$name]: form})

		case 'form/add':
			
			form = action.payload;
			return Object.assign({}, forms, {[form.$name]: form})

		case 'form/update':

			form = action.payload;
			return Object.assign({}, forms, {[form.$name]: form})

		case 'form/reset':
			
			form = action.payload;
			delete forms[form.$name];
			return forms;
		
		case 'forms/inputs/add':

			let formsInAction = action.payload;
			let formsMap = formsInAction.reduce((acc, curr) => {
				let formJson = forms[curr['form']];
				let inputs = curr.inputs;
				inputs.forEach(i => {
					formJson[i.$name] = i;
				})
				return { [curr['form']]: formJson }
			}, {})
			return Object.assign({}, forms, { ...formsMap })

		case 'forms/remove':
		
			return Object.assign({}, _.omit(forms, action.payload.map(f => f.form)))

		case 'forms/inputs/remove':
			
			let objArrToRemove = action.payload;

			let formUpdated = objArrToRemove.map(o => {
				return Object.keys(forms).filter(formName => formName === o.form).map(formName => ({inputs: o.inputs, form: forms[formName]}))[0]
			}).reduce((acc, curr) => {
				let key = curr.form.$name
				let val = _.omit(curr.form, curr.inputs)
				acc[key] = val;
				return acc;
			}, {})
			

			return Object.assign({}, forms, formUpdated)

		case 'forms/inputs/update':

			let objArrToUpdate = action.payload;

			let inputsMap = objArrToUpdate.inputs.map(input => {
				return {
					name: input.$name,
					val: input
				}
			}).reduce((acc, curr) => {
				acc[curr.name] = curr.val;
				return acc;
			}, {})

			let isDirty = inputsMap[Object.keys(inputsMap)[0]].$dirty;
			let formMeta = Object.assign({}, ...forms[objArrToUpdate.form], { ...{ 
				$dirty: isDirty, 
				$pristine: !isDirty
			},  
			...inputsMap })

			const isInvalid = () => {
				let inputs = _.extractField(formMeta);
				return Object.keys(inputs).filter(i => {
					let errors = inputs[i].$error
					return Object.keys(errors).length > 0
				}).length > 0
			}

			let inputsKeys = Object.keys(inputsMap);
			
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
			
			let o = Object.assign({}, {[objArrToUpdate.form]: {}}, {[objArrToUpdate.form]: {...formMeta}})
			return Object.assign({}, forms, o)

		case 'form/submit':
			formName = action.payload;
		
			return Object.assign({}, forms, { [formName]:  {...forms[formName], ...{ $submitted: true }}})

		case 'form/valid':
			formName = action.payload;
		
			return Object.assign({}, forms, { [formName]:  {...forms[formName], ...{ $invalid: false, $valid: true }}})
		
		case 'form/unsubmit':
			formName = action.payload;
		
			return Object.assign({}, forms, { [formName]:  {...forms[formName], ...{ $submitted: false }}})

		default:
			return forms;
	}
}

export default { forms }