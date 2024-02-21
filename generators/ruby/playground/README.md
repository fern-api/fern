# Playground

Welcome to the Fern Ruby playground, here are steps to set up your Ruby environment and playaround with codegen.

## Setting up Ruby

https://www.ruby-lang.org/en/documentation/installation/#homebrew

```sh
brew install ruby
```

### rbenv - Ruby Version Management

https://github.com/rbenv/rbenv

```sh
brew install rbenv ruby-build
```

## CLI testing

Similar to running `python` you can pull up an interactive Ruby shall by running `irb`, with this you can now run Ruby commands, import Gems, etc.!
To test the gem end to end, you can build, install and then use the gem all locally:

```sh
gem build playground.gemspec

gem install playground-0.0.0.gem

irb
~ irb(main):001>
~ irb(main):002>
~ ...
```

## Running tests

If you are looking to run any tests you run within the `test/` directory, you can do so by running:

```sh
bundle exec ruby test/test_playground.rb
```

Similar to Poetry for Python, Bundler is running the command listed after `exec` within a virtual environment with the specified dependencies.

Note that these tests already depend on the `playground` gem, so you will need to build and install it locally if you have not done so already. Instructions to do so can be found above in **CLI testing**.

## Installation for this Gem

TODO: Replace `UPDATE_WITH_YOUR_GEM_NAME_PRIOR_TO_RELEASE_TO_RUBYGEMS_ORG` with your gem name right after releasing it to RubyGems.org. Please do not do it earlier due to security reasons. Alternatively, replace this section with instructions to install your gem from git if you don't plan to release to RubyGems.org.

Install the gem and add to the application's Gemfile by executing:

    $ bundle add UPDATE_WITH_YOUR_GEM_NAME_PRIOR_TO_RELEASE_TO_RUBYGEMS_ORG

If bundler is not being used to manage dependencies, install the gem by executing:

    $ gem install UPDATE_WITH_YOUR_GEM_NAME_PRIOR_TO_RELEASE_TO_RUBYGEMS_ORG

## Usage of this Gem

TODO: Write usage instructions here
