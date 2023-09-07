# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on
your help as much as you rely on ours. If you have any feedback on what we could improve, please
[open an issue](https://github.com/fern-api/fern-go/issues/new) to discuss it!

## Opening an issue

All contributions start with [an issue](https://github.com/fern-api/fern-go/issues/new). Even if you
have a good idea of what the problem is and what the solution looks like, please open an issue. This
will give us an opportunity to align on the problem and solution, and to deconflict in the case that
somebody else is already working on it.

## How can you help?

Review [our documentation](https://www.buildwithfern.com/docs?utm_source=github&utm_medium=readme&utm_campaign=fern-go&utm_content=contributing)! We appreciate any help we can get that makes our documentation more digestible.

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features.
Learn, then share your knowledge with your own circles.

Write code! We've got lots of open issues - feel free to volunteer for one by commenting on the issue.

## Local development

To get started:

**Step 1: Fork this repo**

Fork by clicking [here](https://github.com/fern-api/fern-go/fork).

**Step 2: Clone your fork and open in your favorite editor (e.g. VSCode shown below)**

```sh
git clone <your fork>
cd fern-go
code .
```

**Step 3: Install dependencies**

Install `go` by following [this guide](https://go.dev/doc/install).

Then install the `fern-go-model` and `fern-go-sdk` commands by running:

```sh
make install
```

**Step 4: Compile and test**

### Compiling

To compile all the packages in the repository, run

```sh
go build ./...
```

### Tests

To run the all the tests:

```sh
make test
```

### Updating test fixtures

If you are updating any of the code generators, you will often need to
update the test fixtures so that they reflect the new behavior. To do
so, simply run

```sh
make fixtures
```
