"use strict";

import Router from "koa-tree-router";
import parseurl from "parseurl";

// From: https://github.com/steambap/koa-tree-router/blob/v0.5.0/router.js#L69
// plus: https://github.com/koajs/koa/blob/2.8.2/lib/request.js#L144-L146
function getPath(req) {
  return parseurl(req).pathname;
}

// From: https://github.com/steambap/koa-tree-router/blob/v0.5.0/router.js#L90-L93
function paramsToObject(params) {
  const paramsObj = {};
  params.forEach(({ key, value }) => {
    paramsObj[key] = value;
  });
  return paramsObj;
}

const router = new Router();

export function registerRoute(method, path, handler) {
  router.on(method, path.replace("*", "*foo"), handler);
}

export function findHandler(req) {
  const route = router.find(req.method, getPath(req));
  paramsToObject(route.params);
  const handlers = route.handle;
  return handlers === null ? undefined : handlers[0];
}
