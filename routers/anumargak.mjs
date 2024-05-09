"use strict";

import anumargak from "anumargak";

const router = anumargak();

// console.dir(router);

export function registerRoute(method, path, handler) {
  router.on(method, path, handler);
}

export function findHandler(req) {
  const route = router.find(req.method, req.url);
  return route.handler;
}
