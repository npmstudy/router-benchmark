"use strict";

import fs from "fs";
import Benchmark from "benchmark";

import chalk from "chalk";
import runSuite from "./helpers/runSuite.mjs";

import { join } from "desm";

const routes = [
  ["GET", "/", () => null],
  ["POST", "/user", () => null],
  ["GET", "/user", () => null],
  ["GET", "/user/:userID", () => null],
  ["GET", "/user/:userID/posts", () => null],
  ["GET", "/user/:userID/posts/:postID", () => null],
  ["GET", "/users/all", () => null],
  ["GET", "/an/unnecessarily/long/nested/route/here", () => null],
  ["GET", "/static/*", () => null],
  ["GET", "/sign-up", () => null],
  ["GET", "/login", () => null],
  ["GET", "/event/:id", () => null],
  ["GET", "/map/:location/events", () => null],
];

function getExpectedHandler(path, method = "GET") {
  return routes.find((route) => route[0] === method && route[1] === path)[2];
}

const testRoutes = {
  "short static": {
    method: "GET",
    url: "/user",
    expectedHandler: getExpectedHandler("/user"),
  },
  "short static POST": {
    method: "POST",
    url: "/user",
    expectedHandler: getExpectedHandler("/user", "POST"),
  },
  "static with query string": {
    method: "GET",
    url: "/user?foobar",
    expectedHandler: getExpectedHandler("/user"),
  },
  "static with common prefix": {
    method: "GET",
    url: "/users/all",
    expectedHandler: getExpectedHandler("/users/all"),
  },
  "long static": {
    method: "GET",
    url: "/an/unnecessarily/long/nested/route/here",
    expectedHandler: getExpectedHandler(
      "/an/unnecessarily/long/nested/route/here"
    ),
  },
  "single parameter": {
    method: "GET",
    url: "/user/123456789",
    expectedHandler: getExpectedHandler("/user/:userID"),
  },
  "parameter in the middle": {
    method: "GET",
    url: "/user/123456789/posts",
    expectedHandler: getExpectedHandler("/user/:userID/posts"),
  },
  "multiple parameters": {
    method: "GET",
    url: "/user/123456789/posts/my-very-first-post",
    expectedHandler: getExpectedHandler("/user/:userID/posts/:postID"),
  },
  wildcard: {
    method: "GET",
    url: "/static/favicon.ico",
    expectedHandler: getExpectedHandler("/static/*"),
  },
  "route not found (404)": {
    method: "GET",
    url: "/not-found",
    expectedHandler: undefined,
  },
};

const suites = {
  "all routes": new Benchmark.Suite(),
};
for (const name in testRoutes) {
  suites[name] = new Benchmark.Suite();
}

const routers = fs
  .readdirSync("./routers")
  .filter((fileName) => fileName.endsWith(".mjs"));

for (const router of routers) {
  const { registerRoute, findHandler } = await import(
    join(import.meta.url, "./routers", router)
  );

  for (const [method, path, handler] of routes) {
    registerRoute(method, path, handler);
  }

  const allTests = [];

  for (const testName in testRoutes) {
    const { method, url, expectedHandler } = testRoutes[testName];

    suites[testName].add(router, () => {
      const req = { method, url };
      const handler = findHandler(req);

      if (handler !== expectedHandler) {
        // Validate that the router worked as expected
        console.log(router, "failed to look up the correct route:", req);
        process.exit(1);
      }
    });

    allTests.push({ method, url });
  }

  suites["all routes"].add(router, () => {
    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      const req = { method: test.method, url: test.url };
      findHandler(req);
    }
  });
}

for (const suiteName in suites) {
  const suite = suites[suiteName];

  suite.on("start", () => {
    const testRoute = testRoutes[suiteName];

    if (testRoute === undefined) {
      console.log(chalk.bold.yellow(suiteName));
      return;
    }

    const route = routes.find((rt) => rt[2] === testRoute.expectedHandler);
    const path =
      route === undefined || testRoute.url.includes("?")
        ? testRoute.url
        : route[1];
    console.log(`${chalk.bold.yellow(suiteName)} - ${chalk.gray(path)}`);
  });

  runSuite(suite, "    ");
}
