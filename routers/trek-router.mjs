"use strict";

import Router from "trek-router";
import getURLPath from "../helpers/getURLPath.mjs";

function paramsToObject(params) {
  const paramsObj = {};
  for (let i = 0; i < params.length; i++) {
    paramsObj[params[i].name] = params[i].value;
  }
  return paramsObj;
}

const router = new Router();

export function registerRoute(method, path, handler) {
  router.add(method, path, handler);
}
export function findHandler(req) {
  const route = router.find(req.method, getURLPath(req.url));
  paramsToObject(route[1]);
  return route[0];
}
