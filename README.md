[![Build Status](https://travis-ci.org/gobble43/gobble-template.svg?branch=master)](https://travis-ci.org/gobble43/gobble-template)

[![Stories in Ready](https://badge.waffle.io/gobble43/gobble-template.svg?label=ready&title=Ready)](http://waffle.io/gobble43/gobble-template)

# gobble-template
> Boilerplate reference for Gobble microservices. Includes:
 - Mocha + Chai + SuperTest setup
 - Travis CI setup
 - ESLint (Airbnb ES6) Setup
 - Git Workflow Demo w/ Pull Request

## Table of Contents
1. [Getting started](#getting-started)
2. [Tech](#tech)
3. [Team](#team)
4. [Contributing](#contributing)

## Getting started

Clone and install dependencies:
```sh
$ git clone https://github.com/gobble43/gobble-template.git
$ cd gobble-template
$ npm install
```
Create `env/development.env` and set environment variables. Follow `env/example.env`.

```sh
$ npm start
```

#### Testing

Configure the environment variable `NODE_ENV` prior to running tests.

 ```sh
$ export NODE_ENV=development
$ npm test
```

## Tech
 - Node
 - Express
 - Mocha
 - SuperTest

## Directory Layout
```
gobble-template
├── /env/                       # Environment variables
├── /src/                       # Express server source
├── /test/                      # Mocha SuperTest tests
```

## Team
  - Product Owner:            [Leo Adelstein](https://github.com/leoadelstein)
  - Scrum Master:             [Jack Zhang](https://github.com/jackrzhang)
  - Development Team Members: [Leo Adelstein](https://github.com/leoadelstein), [Jinsoo Cha](https://github.com/jinsoocha), [Will Tang](https://github.com/willwtang/shortly-deploy), [Jack Zhang](https://github.com/jackrzhang)

## Contributing
See [STYLE-GUIDE.md](https://github.com/gobble43/docs/blob/master/STYLE-GUIDE.md) and [CONTRIBUTING.md](https://github.com/gobble43/docs/blob/master/CONTRIBUTING.md) for contribution guidelines.
