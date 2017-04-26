"use strict";

var _h = require("../src/ninja-core/h");

var a = (0, _h.h)(
  "ul",
  { "class": "list", xx: "fff", yy: "xxx" },
  (0, _h.h)(
    "li",
    null,
    "item 1"
  ),
  (0, _h.h)(
    "li",
    null,
    "item 2"
  )
);

console.log(a);
