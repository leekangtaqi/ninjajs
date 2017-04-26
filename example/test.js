import { render } from '../src/ninja-core/render';
import Component from '../src/ninja-core/component';
import { h } from '../src/ninja-core/h';

class Test extends Component{
	constructor() {
		super()
		this.state = {
			ok: '33333'
		}
	}
	componentWillMount() {
		setTimeout(() => {
			this.setState({ok: '33333dsafdsafs'})
		}, 1000)
	}
	render() {
		return (<ul>
			<li>{ this.state.ok }</li>
			<li>22</li>
		</ul>)
	}
}

render(<Test></Test>, document.body)



