"use strict";

import Benchmark from "benchmark";
import fs from "fs";
import { join } from "desm";

import routes from "./routes.mjs";
import runSuite from "../../helpers/runSuite.mjs";

const suite = new Benchmark.Suite();

const routers = fs
  .readdirSync(join(import.meta.url, "../../routers"))
  .filter((fileName) => fileName.endsWith(".mjs"));

nextRouter: for (const router of routers) {
  const { registerRoute, findHandler } = await import(
    join(import.meta.url, "../../routers", router)
  );
  for (const [method, path] of routes) {
    try {
      registerRoute(method, path, () => null);
    } catch (err) {
      console.log(
        router,
        "- skipping since it doesn’t support all routes in this API"
      );
      continue nextRouter;
    }
  }

  suite.add(router, () => {
    for (let i = 0; i < routes.length; i++) {
      const req = { method: routes[i][0], url: routes[i][2] };
      findHandler(req);
    }
  });
}

console.log();

runSuite(suite);
