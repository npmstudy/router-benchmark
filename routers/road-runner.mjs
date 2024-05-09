"use strict";

import { RoadRunner } from "@parisholley/road-runner";
import getURLPath from "../helpers/getURLPath.mjs";

const router = new RoadRunner();

export function registerRoute(method, path, handler) {
  router.addRoute(method, path, handler);
}
export function findHandler(req) {
  const route = router.findRoute(req.method, getURLPath(req.url));
  return route === null ? undefined : route.value;
}
