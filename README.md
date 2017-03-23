<p align="center">
<a target="_blank">
<img width="496" style="margin: 0" src="https://github.com/leekangtaqi/ninjajs/raw/master/assets/images/ninja.png"/>
</a>
</p>
<p align="center"> <b>Micro and elegant frontend framework</b></p>

Like a ninja, Ninjajs dexterous and elegant, and its body full of magic weapons that simple but powerful.
Ninjajs will help you to use the simple way to build complex systems.
<b>"Practical but not fancy" is its talisman.</b>

## Geting Started

## Install

```shell
$ npm install ninjajs
```

## Pay A Glance

```
$ npm run dev
```

http://localhost:8080

## Usage

### Startup

main.js

```javascript
import App from 'path to xxx component'

let app = Ninja({container: window, reducer, middlewares, state: {}}) // container, reducer, middlewares, initialState

app.set('routes', routes)

app.start(async () => {
  // set entry for the application.
  app.set('entry', new App(document.getElementById('app')))
})
```

### API

**set(key, val)**

* <code>key</code>  \<String\>
* <code>val</code>  \<Any\>

  buildin config - key -> value
  * <code>env</code>      \<Enum\>    application environment - production, development, test
  * <code>mode</code>     \<Enum\>    browser or history
  * <code>context</code>  \<Object\>  application context obj (store, tags, ...others)
  * <code>routes</code>   \<Object\>  expect a plain obj to describe the routes (more in below)
  * <code>entry</code>    \<Object\>  application entry component


**registerWidget(options)**

* <code>options.name</code>     \<string\>
* <code>options.methods</code>  \<array\>
  
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
export default class Todo extends Ninja.Component {

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
export default class Todo extends Ninja.Component {}
```


### Router

#### Define routes

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
  <router-outlet></router-outlet> <!-- sub routers will replace here  -->
</div>
```

#### Component life cycle about router

| evts         | 
| ------------ |
| enter         |
| before-leave |
| leave        |
| leaved       |

eg: 

```javascript
@View // this decorator specify that component will be a view, give the component relevant features
export default class Todo extends Ninja.Component {
  // ...others
  onCreate(opts) {
    this.on('enter', ctx => {
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
// Advanced Usage
class Foo extends Ninja.Component {
  // ...others
  
  // decorator onUse <Function>
  // @param <Array | String>, when nav to this component, the middlewares (defined in 'opts') will be invoke.
  //   each middleware method will be injected a callback ( component will be present when the callback invoked ) and a  
  //   router context object. 
  // eg: const enterFoo = (next, ctx)
  @onUse('enterFoo')
  onCreate(opts) {}
}
```

#### Route hooks

**1. history-pending - callback(from, to, location, context[, next])**

* <code>from</code> \<Object\> from which Component
* <code>to</code> \<Object\> to which Component
* <code>location</code> \<String\> uri
* <code>context</code> \<Object\> context object
  * <code>req</code> \<Object\> request object
    * <code>params</code> \<Object\>
    * <code>body</code> \<Object\>
    * <code>query</code> \<Object\>
* <code>next</code> \<Function\> execution callback, if exists, the execution won`t be continue until next being executed

**2. history-resolve - callback(from, to, context, routes, index[, next])**

* <code>from</code> \<Object\> from which Component
* <code>to</code> \<Object\> to which Component
* <code>context</code> \<Object\> context object
  * <code>req</code> \<Object\> request object
    * <code>params</code> \<Object\>
    * <code>body</code> \<Object\>
    * <code>query</code> \<Object\>
* <code>routes</code> \<Object\> uris
* <code>index</code> \<Number\> current index in uris
* <code>next</code> \<Function\> execution callback, if exists, the execution won`t be continue until next being executed

eg:

```
app.hub.subscribe('history-pending', (from, to, location, context, next) => {})

app.hub.subscribe('history-resolve', (from, to, context, routes, index) => {})
```

### Form

#### Buildin rules

* required
* max
* min
* maxlength
* minlength
* pattern

#### API

* registerValidators(name, fn)
  * name \<string\>
  * fn \<Function\>
  
Register customer validators  

#### Detail

* Integrate with Redux
A action will be dispatched when interact with inputs.
You will get corrent value in state and opts.
Attached to opts: 
  * submit \<Function\> submit specific form manually.
  * forms \<Object\> forms map.

* input fields & add class

  * field
    * $valid
    * $invalid
    * $dirty
    * $pristine
    * $error
    * $originVal
    * $val
  * class
    * f-valid
    * f-invalid
    * f-dirty
    * f-pristine
    
* multi form validation supported

#### Example

```javascript
@Form({
  username: {
    required: true,
    minlength: 2,
    maxlength: 20
  },
  password: {
    required: true,
    min: 1,
    max: 10
  },
  address: {
    pattern: /.*/
  }
})
class Foo extends Ninja.Component {
  // ...others
  async onSubmit() {
    e.preventDefault();
    this.opts.submit('FormA')   // submit specific form manually
    if (this.opts.forms.FormA.$invalid) {
      return;
    }
  }
}
```

```html
<style>
  .f-valid {
    border: green
  }
  .f-invalid {
    border: red
  }
  .f-dirty {
  }
  .f-pristine {
  }
</style>
<form ref="FormA">
  <p if="{ opts.forms.FormA.$submitted && opts.forms.FormA.username.$error.required }" class="help-block" >username required! </p>
  <input type="text" ref="username">
</form>
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
import { router Ninja } from 'ninjajs';

let app = new Ninja(container, reducer, middlewares, initialState);  // create ninja application

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
  
  import { connect } from 'ninjajs';
  
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

## Who's using

<img width="120" src="https://github.com/leekangtaqi/ninjajs/raw/master/assets/images/91pintuan.png"/>

<img width="120" src="https://github.com/leekangtaqi/ninjajs/raw/master/assets/images/91songli.png"/>

## More
source for more detail    

## Contact

QQ: 2811786667
