# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern-openapi/issues/new) to discuss it!

## Opening an issue

All contributions start with [an issue](https://github.com/fern-api/fern-openapi/issues/new). Even if you have a good idea of what the problem is and what the solution looks like, please open an issue. This will give us an opportunity to align on the problem and solution, and to deconflict in the case that somebody else is already working on it.

## How can you help?

Review [our documentation](https://buildwithfern.com/docs?utm_source=github&utm_medium=readme&utm_campaign=fern-openapi&utm_content=contributing)! We appreciate any help we can get that makes our documentation more digestible.

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features. Learn, then share your knowledge with your own circles.

Write code! We've got lots of open issues - feel free to volunteer for one by commenting on the issue.

## Local development

The OpenAPI generator is written in Typescript.

To get started:

**Step 1: Fork this repo**

Fork by clicking [here](https://github.com/fern-api/fern-openapi/fork).

**Step 2: Clone your fork and open in your editor (e.g., VSCode)**

```
git clone <your fork>
cd fern-openapi
code .
```

**Step 3: Install dependencies**

```
yarn
```

### Compiling

To compile the packages in this monorepo, run `yarn compile`.

### Unit Testing

You can run jest unit tests by running `yarn test`. Some of 
our tests are snapshot tests; if you need to update the
snapshots run `yarn test -u`. 

### Integration Testing

For integration testing we use a testing tool called seed. Seed 
is a CLI that will dockerize the generator, run the generator with 
[test definitions](https://github.com/fern-api/fern/tree/main/test-definitions/fern/apis)
and write out the output to [disk](./seed/openapi/). 

After you make a change, run seed by doing the following
```bash
# The seed version can be found in .github/workflows/check.yml
npm install -g @fern-api/seed-cli@0.15.0-rc51 

# Running seed requires the docker daemon to be running
seed test --workspace openapi --parallel 10 
```
