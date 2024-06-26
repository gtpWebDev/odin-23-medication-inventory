# odin-22-medication-inventory

An assignment in the nodejs module of the Odin Project.

## Install the express-generator

It is assumed that the express generator has been installed globally. If not, do so:

```bash
$ npm install -g express-generator
```

## Create the express project and git repository

Either:

1. create the express project, initialise the git repository locally, then add the repository to github
   or
2. Create a repository with the template, with the express project already created (not done and tested yet).

### Option 1 - create the express project first:

Create the project with the projectname, from the general repo directory

```bash
 express projectname --view=pug
```

In the directory, install the dependencies

```bash
 npm install
```

Add **gitignore** and remove node_modules

```js
node_modules;
```

Initialise the git repo, setting the name of the default branch.
Add and commit the new files.

```git
git init -b main
git add .
git commit -m "Initial commit"
```

Create the repository on github as usual, with no readme file or gitignore.
Then follow the instructions for
"…or push an existing repository from the command line"

```bash
git remote add origin insertSSHhere
git branch -M main
git push -u origin main
```

### Option 2 - create a git repository with the express project template

YET TO ADD

## Install nodemon to enable live updates of the server

(If nodemon is installed globally, this is not necessary.)
Nodemon ensures that on any update to the server, it is refreshed.
Note though, a page refresh is still necessary to see any changes created by the server.

```bash
npm install --save-dev nodemon
```

## Add npm scripts for ease

Note the serverstart option enables console logging

```js
  "scripts": {
    "devstart": "nodemon ./bin/www",
    "serverstart": "DEBUG=projectname:* npm run devstart"
  },
```

## Bring the dependency versions up to date, and update them

**package.json**

```js
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "debug": "^4.3.5",
    "express": "^4.19.2",
    "http-errors": "~2.0.0",
    "morgan": "^1.10.0",
    "ejs": "^3.1.10"
  },
```

```bash
npm install
```

## Install Mongoose

Installing mongoose installs all its dependencies and the MongoDB database driver, but not MongoDB itself.

```bash
npm install mongoose
```

## Install Async Error Handler

express-async-handler is a simplifying library that gives a short hand for error catching, replacing a try catch structure which sends the error to the next middleware on error

express-ejs-layouts - update once know

```bash
npm install express-async-handler
npm install express-ejs-layouts
```
