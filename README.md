# Ninjia

<img width="240" src="https://github.com/leekangtaqi/ninjiajs/raw/master/logo.png"/>

Fullstack framework based on riot, redux, express.

---

##Geting Started

###Install

```
npm install ninjiajs
```

### Usage

routes.js
```javascript
export default {
	component: 'app',
	children: [
		{
			path: '/',
			defaultRoute: true,
			component: 'count',
		},
		{
			path: '/test',
			component: 'test',
			children: [
				{
					path: '/test2',
					component: 'test2'
				}
			]
		}
	]
}
```

```javascript
//main.js
import { router Ninjia } from 'ninjiajs';

let app = new Ninjia(container, reducer, middlewares, initialState);  // create ninjia application

app.set('env', process.env.NODE_ENV === 'production' ? 'production' : 'development');

app.set('mode', 'browser');

app.set('context', { store: app.store, hub: router.hub, tags: {} });

router.hub.routes = routes;  // set routes

app.router(router);

app.start(async () => {
  //todo
})

```

```javascript
//component

require('path-to-nest');

<app>
  <div>Hello World</div>
  <router-outlet></router-outlet>
  
  import { connect } from 'ninjiajs';
  
  connect(              //redux like
    state => ({}),
    dispatch => ({})
  )(this)
  
  this.mixin('router');   // mixin router, if you wanna use middleware (the $use method)
  
  this.$use(function(next, ctx){
    //trigger when nav to this component
  })
</app>

```

##Example
source for more detail    

##QQ
2811786667
