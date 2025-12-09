# frozen_string_literal: true

require "test_helper"

describe <%= gem_namespace %>::Internal::Types::Model do
  module StringInteger
    extend <%= gem_namespace %>::Internal::Types::Union

    member String
    member Integer
  end

  class ExampleModel < <%= gem_namespace %>::Internal::Types::Model
    field :name, String
    field :rating, StringInteger, optional: true
    field :year, Integer, optional: true, nullable: true, api_name: "yearOfRelease"
  end

  class ExampleModelInheritance < ExampleModel
    field :director, String
  end

  class ExampleWithDefaults < ExampleModel
    field :type, String, default: "example"
  end

  class ExampleChild < <%= gem_namespace %>::Internal::Types::Model
    field :value, String
  end

  class ExampleParent < <%= gem_namespace %>::Internal::Types::Model
    field :child, ExampleChild
  end

  describe ".field" do
    before do
      @example = ExampleModel.new(name: "Inception", rating: 4)
    end

    it "defines fields on model" do
      assert_equal %i[name rating year], ExampleModel.fields.keys
    end

    it "defines fields from parent models" do
      assert_equal %i[name rating year director], ExampleModelInheritance.fields.keys
    end

    it "sets the field's type" do
      assert_equal String, ExampleModel.fields[:name].type
      assert_equal StringInteger, ExampleModel.fields[:rating].type
    end

    it "sets the `default` option" do
      assert_equal "example", ExampleWithDefaults.fields[:type].default
    end

    it "defines getters" do
      assert_respond_to @example, :name
      assert_respond_to @example, :rating

      assert_equal "Inception", @example.name
      assert_equal 4, @example.rating
    end

    it "defines setters" do
      assert_respond_to @example, :name=
      assert_respond_to @example, :rating=

      @example.name = "Inception 2"
      @example.rating = 5

      assert_equal "Inception 2", @example.name
      assert_equal 5, @example.rating
    end
  end

  describe "#initialize" do
    it "sets the data" do
      example = ExampleModel.new(name: "Inception", rating: 4)

      assert_equal "Inception", example.name
      assert_equal 4, example.rating
    end

    it "allows extra fields to be set" do
      example = ExampleModel.new(name: "Inception", rating: 4, director: "Christopher Nolan")

      assert_equal "Christopher Nolan", example.director
    end

    it "sets the defaults where applicable" do
      example_using_defaults = ExampleWithDefaults.new

      assert_equal "example", example_using_defaults.type

      example_without_defaults = ExampleWithDefaults.new(type: "not example")

      assert_equal "not example", example_without_defaults.type
    end

    it "coerces child models" do
      parent = ExampleParent.new(child: { value: "foobar" })

      assert_kind_of ExampleChild, parent.child
    end

    it "uses the api_name to pull the value" do
      example = ExampleModel.new({ name: "Inception", yearOfRelease: 2014 })

      assert_equal 2014, example.year
      refute_respond_to example, :yearOfRelease
    end
  end

  describe "#inspect" do
    class SensitiveModel < <%= gem_namespace %>::Internal::Types::Model
      field :username, String
      field :password, String
      field :client_secret, String
      field :access_token, String
      field :api_key, String
    end

    it "redacts sensitive fields" do
      model = SensitiveModel.new(
        username: "user123",
        password: "secret123",
        client_secret: "cs_abc",
        access_token: "token_xyz",
        api_key: "key_123"
      )

      inspect_output = model.inspect

      assert_includes inspect_output, "username=\"user123\""
      assert_includes inspect_output, "password=[REDACTED]"
      assert_includes inspect_output, "client_secret=[REDACTED]"
      assert_includes inspect_output, "access_token=[REDACTED]"
      assert_includes inspect_output, "api_key=[REDACTED]"
      refute_includes inspect_output, "secret123"
      refute_includes inspect_output, "cs_abc"
      refute_includes inspect_output, "token_xyz"
      refute_includes inspect_output, "key_123"
    end

    it "does not redact non-sensitive fields" do
      example = ExampleModel.new(name: "Inception", rating: 4)
      inspect_output = example.inspect

      assert_includes inspect_output, "name=\"Inception\""
      assert_includes inspect_output, "rating=4"
    end
  end
end
