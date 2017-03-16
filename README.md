# NinjiaJs

<img width="180" src="https://github.com/leekangtaqi/ninjiajs/raw/master/logo.png"/>

**Micro and elegant frontend framework**


---

## Geting Started

## Install

```shell
$ npm install ninjiajs
```

## Usage

### Startup

main.js

```javascript
let app = Ninjia({container: window, reducer, middlewares, state: {}}) // container, reducer, middlewares, initialState

app.set('routes', routes)

app.start(async () => {
  // set entry for the application.
  app.set('entry', new App(document.getElementById('app'), {store: app.store}))
})
```

### API

**set(key, val)**

* key  \<string\>
* val  \<any\>

  buildin config - key -> value
  * env      \<enum\>    application environment - production, development, test
  * mode     \<enum\>    browser or history
  * context  \<object\>  application context obj (store, tags, ...others)
  * routes   \<object\>  expect a plain obj to describe the routes (more in below)
  * entry    \<object\>  application entry component


**registerWidget(options)**

* options.name     \<string\>
* options.methods  \<array\>
  
  allow user to control component with method invocation.
  
  eg: 
  
  app.registerWidget({
    name: 'modal',
    methods: ['open']
  })

**start()**

  all ready callback

### Component

#### Define component

```javascript
@Componnet // register this component to hub, in order to use it in html directly.
export default class Todo extends riot.Tag {
  static originName = 'todo'
  
  get name() {
    return 'todo'
  }

  get tmpl() {
    return require('path to template of component');
  }

  onCreate(opts) {}
}
```

#### State Management
redux like:

```javascript
@Connect(
  state => ({
    ...states
  }),
  dispatch => ({
    ...actions
  })
)
export default class Todo extends riot.Tag {}
```


### Router

### Define routes

```javascript
import TodoList from '...path to component';

export default {
  component: App,
  path: '',
  children: [
    {
      path: '/',
      component: TodoList,
      defaultRoute: true
    }
  ]
}
```
#### Fields
| field         | type          | desc  |
| ------------- |:-------------:| :-----|
| path          | string        | Corresponding URI, Relative path |
| component     | Object        | Component constructors |
| children      | Array         | sub routes outlets           |
| defaultRoute  | Boolean       | specify that this is a default route |
| components    | Object        | dynamic route defined, get identifier from query string |
| abstract      | Boolean       | specify that this is a abstract route, no Corresponding component |
| ...others     | Any           | will be get from context.req.body           |

#### Context
1. req \<Object\>

| field    | type        |
| -------- |:----------- |
| params   | Object      |
| body     | Object      |
| query    | Object      |

#### Router outlet in html
```html
<div class="component">
  <div>greeting!</div>
  <router-outlet></router-outlet> <!-- sub routers will replace it  -->
</div>
```

#### Component life cycle about router

| evts         | 
| ------------ |
| open         |
| before-leave |
| leave        |
| leaved       |

eg: 

```javascript
@View // this decorator specify that component will be a view, give the component relevant features
export default class Todo extends riot.Tag {
  // ...others
  onCreate(opts) {
    this.on('open', ctx => {
      // todo
    })
    this.on('before-leave', ctx => {
      // todo
    })
    this.on('leave', ctx => {
      // todo
    })
    this.on('leaved', ctx => {
      // todo
    })
  }
}
```

```javascript
class Foo extends riot.Tag {
  // ...others
  
  // decorator onUse <Function>
  // @param <Array | String>, when nav to this component, the middlewares (defined in 'opts') will be invoke.
  //   each middleware method will be injected a callback ( component will be present when the callback invoked ) and a  
  //   router context object. 
  eg: const enterFoo = (next, ctx)
  @onUse('enterFoo')
  onCreate(opts) {}
}
```

#### Route hooks

1. history-pending

| params       | 
| ------------ |
| from         |
| to           |
| $location    |
| context      |
| next         |

2. history-resolve

| params      | 
| ----------- |
| from        |
| to          |
| ctx         |
| hints       |
| index       |

eg:

```
app.hub.subscribe('history-pending', async (from, to, $location, { req }, next) => {})

app.hub.subscribe('history-resolve', (from, to, ctx, hints, index) => {})
```

### Usage v2.* (Deprecated)

#### routes.js
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

## More
source for more detail    

## Contact

QQ: 2811786667
