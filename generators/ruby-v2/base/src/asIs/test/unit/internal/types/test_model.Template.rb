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

  class ExampleWithBooleans < <%= gem_namespace %>::Internal::Types::Model
    field :enabled, <%= gem_namespace %>::Internal::Types::Boolean
    field :archived, <%= gem_namespace %>::Internal::Types::Boolean, default: true
  end

  class ExampleWithFalseDefault < <%= gem_namespace %>::Internal::Types::Model
    field :archived, <%= gem_namespace %>::Internal::Types::Boolean, default: false
  end

  class ExampleChild < <%= gem_namespace %>::Internal::Types::Model
    field :value, String
  end

  class ExampleParent < <%= gem_namespace %>::Internal::Types::Model
    field :child, ExampleChild
  end

  class ExampleWithNumericKeyMaps < <%= gem_namespace %>::Internal::Types::Model
    field :rates, <%= gem_namespace %>::Internal::Types::Hash[Float, Integer]
    field :counts, <%= gem_namespace %>::Internal::Types::Hash[Integer, String]
  end

  class ExampleWithCoercedDefault < <%= gem_namespace %>::Internal::Types::Model
    field :count, Integer, default: "3"
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

    it "drops extra keys that match a declared field case-insensitively" do
      example = ExampleModel.load({ name: "Inception", NAME: "Other", YearOfRelease: 1999, Year: 1998 }.to_json)

      assert_equal "Inception", example.name
      assert_equal({ "name" => "Inception" }, example.to_h)
      refute_respond_to example, :NAME
    end

    it "drops case-insensitive collisions even when the declared field is absent" do
      example = ExampleModel.new({ "NAME" => "Other", "yearofrelease" => 1999 })

      assert_nil example.name
      refute example.to_h.key?("NAME")
      refute example.to_h.key?("yearofrelease")
    end

    it "keeps non-colliding extra keys" do
      example = ExampleModel.load({ name: "Inception", brand_new_field: "kept" }.to_json)

      assert_equal "kept", example.brand_new_field
      assert_equal({ "name" => "Inception", "brand_new_field" => "kept" }, example.to_h)
    end

    it "sets the defaults where applicable" do
      example_using_defaults = ExampleWithDefaults.new

      assert_equal "example", example_using_defaults.type

      example_without_defaults = ExampleWithDefaults.new(type: "not example")

      assert_equal "not example", example_without_defaults.type
    end

    it "coerces numeric map keys when loading JSON" do
      model = ExampleWithNumericKeyMaps.load('{"rates":{"1.5":10},"counts":{"2":"two"}}')

      assert_equal({ 1.5 => 10 }, model.rates)
      assert_equal({ 2 => "two" }, model.counts)
    end

    it "coerces child models" do
      parent = ExampleParent.new(child: { value: "foobar" })

      assert_kind_of ExampleChild, parent.child
    end

    it "preserves false values instead of treating them as absent" do
      example = ExampleWithBooleans.new(enabled: false)

      refute example.enabled
      assert_equal({ "enabled" => false, "archived" => true }, example.to_h)

      loaded = ExampleWithBooleans.load({ enabled: false, archived: false }.to_json)

      refute loaded.enabled
      refute loaded.archived
    end

    it "prefers the first non-nil value when both api_name and field name are given" do
      example = ExampleModel.new({ name: "Ruby", yearOfRelease: nil, year: 2014 })

      assert_equal 2014, example.year
      assert_equal({ "name" => "Ruby", "yearOfRelease" => 2014 }, example.to_h)

      example = ExampleModel.new({ name: "Ruby", yearOfRelease: 2010, year: 2014 })

      assert_equal 2010, example.year
      assert_equal({ "name" => "Ruby", "yearOfRelease" => 2010 }, example.to_h)
    end

    it "applies a default of false" do
      example = ExampleWithFalseDefault.new

      refute example.archived
      assert_equal({ "archived" => false }, example.to_h)
    end

    it "uses the api_name to pull the value" do
      example = ExampleModel.new({ name: "Inception", yearOfRelease: 2014 })

      assert_equal 2014, example.year
      refute_respond_to example, :yearOfRelease
    end

    it "does not modify the input hash" do
      input = { name: "Inception", yearOfRelease: 2014, extra: "kept" }
      ExampleModel.new(input)

      assert_equal({ name: "Inception", yearOfRelease: 2014, extra: "kept" }, input)
    end

    it "marks a field explicit when it is set through either key" do
      assert_equal({ "name" => "Ruby", "yearOfRelease" => nil }, ExampleModel.new({ name: "Ruby", year: nil }).to_h)
      assert_equal({ "name" => "Ruby", "yearOfRelease" => nil },
                   ExampleModel.new({ name: "Ruby", yearOfRelease: nil, year: nil }).to_h)
      assert_equal({ "name" => "Ruby" }, ExampleModel.new({ name: "Ruby" }).to_h)
    end

    it "coerces the default of a field whose value is nil" do
      assert_equal 3, ExampleWithCoercedDefault.new(count: nil).count
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
