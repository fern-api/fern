# frozen_string_literal: true

require_relative "inline_type_1"
require "ostruct"
require "json"

module SeedObjectClient
  class RootType1
    # @return [String]
    attr_reader :foo
    # @return [SeedObjectClient::InlineType1]
    attr_reader :bar
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param foo [String]
    # @param bar [SeedObjectClient::InlineType1]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedObjectClient::RootType1]
    def initialize(foo:, bar:, additional_properties: nil)
      @foo = foo
      @bar = bar
      @additional_properties = additional_properties
      @_field_set = { "foo": foo, "bar": bar }
    end

    # Deserialize a JSON object to an instance of RootType1
    #
    # @param json_object [String]
    # @return [SeedObjectClient::RootType1]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      foo = parsed_json["foo"]
      if parsed_json["bar"].nil?
        bar = nil
      else
        bar = parsed_json["bar"].to_json
        bar = SeedObjectClient::InlineType1.from_json(json_object: bar)
      end
      new(
        foo: foo,
        bar: bar,
        additional_properties: struct
      )
    end

    # Serialize an instance of RootType1 to a JSON object
    #
    # @return [String]
    def to_json(*_args)
      @_field_set&.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given
    #  hash and check each fields type against the current object's property
    #  definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.foo.is_a?(String) != false || raise("Passed value for field obj.foo is not the expected type, validation failed.")
      SeedObjectClient::InlineType1.validate_raw(obj: obj.bar)
    end
  end
end
