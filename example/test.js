import { Ninjia, Component, uiLib, Connect } from '../src/index'

let reducer = {
	count: (count = 0, action) => {
		switch (action.type) {
			case 'increase':
				return ++count;
			default:
				return 0
		}
	}
}

@Connect(state => ({
	count: state.count
}))
@Component
class Tag extends Ninjia.Component {
	get tmpl () {
		return `
			<h1>Greeting !</h1>	
			<h2>{opts.count}</h2>
		`
	}
	onCreate () {
		setInterval(() => {
			app.store.dispatch({type: 'increase'})
		}, 1000)
	}
}

let app = Ninjia({ container: window, store: {}, reducer })

app.set('routes', {})

app.start(async () => {
	let tag = new Tag(document.getElementById('app'), {store: app.store})
	app.set('entry', tag)
})



