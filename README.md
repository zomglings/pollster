# pollster

Hurry up and wait

- - -

[![Travis](https://img.shields.io/travis/nkashy1/pollster.svg?style=for-the-badge)](https://github.com/nkashy1/pollster)

pollster allows you to set up polls for any kind of event or change, with custom handlers.

## Getting started

In order to run pollster, you will need [node.js](https://nodejs.org) (v9.11).

To install it, run:

```
npm install @nkashy1/pollster
```

You can define your predicates (what you poll on) in any language -- if they can be run from the
command line, you can use the [`spawnPredicate` utility](https://github.com/nkashy1/pollster/blob/master/predicates.js)
to use them with pollster.

Currently, pollster requires you to define your handlers in node. This can change if there is sufficient
demand for it (just open an issue).

[This example](https://gist.github.com/nkashy1/304a372d4873ac705ea287ac2ce2097c) shows you how to
set up a poll on the creation of a specific file and send an SMS in response.

