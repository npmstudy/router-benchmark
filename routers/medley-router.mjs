"use strict";

import Router from "@medley/router";

const router = new Router();

export function registerRoute(method, path, handler) {
  const store = router.register(path);
  store[method] = handler;
}

export function findHandler(req) {
  const route = router.find(req.url);
  return route === null ? undefined : route.store[req.method];
}
