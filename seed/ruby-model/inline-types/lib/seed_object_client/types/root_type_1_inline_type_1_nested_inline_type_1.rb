# frozen_string_literal: true

require_relative "inline_enum_1"
require_relative "reference_type"
require "ostruct"
require "json"

module SeedObjectClient
  # lorem ipsum
  class RootType1InlineType1NestedInlineType1
    # @return [String] lorem ipsum
    attr_reader :foo
    # @return [String] lorem ipsum
    attr_reader :bar
    # @return [SeedObjectClient::InlineEnum1] lorem ipsum
    attr_reader :my_enum
    # @return [SeedObjectClient::ReferenceType] lorem ipsum
    attr_reader :ref
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param foo [String] lorem ipsum
    # @param bar [String] lorem ipsum
    # @param my_enum [SeedObjectClient::InlineEnum1] lorem ipsum
    # @param ref [SeedObjectClient::ReferenceType] lorem ipsum
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedObjectClient::RootType1InlineType1NestedInlineType1]
    def initialize(foo:, bar:, my_enum:, ref:, additional_properties: nil)
      @foo = foo
      @bar = bar
      @my_enum = my_enum
      @ref = ref
      @additional_properties = additional_properties
      @_field_set = { "foo": foo, "bar": bar, "myEnum": my_enum, "ref": ref }
    end

    # Deserialize a JSON object to an instance of
    #  RootType1InlineType1NestedInlineType1
    #
    # @param json_object [String]
    # @return [SeedObjectClient::RootType1InlineType1NestedInlineType1]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      foo = parsed_json["foo"]
      bar = parsed_json["bar"]
      my_enum = parsed_json["myEnum"]
      if parsed_json["ref"].nil?
        ref = nil
      else
        ref = parsed_json["ref"].to_json
        ref = SeedObjectClient::ReferenceType.from_json(json_object: ref)
      end
      new(
        foo: foo,
        bar: bar,
        my_enum: my_enum,
        ref: ref,
        additional_properties: struct
      )
    end

    # Serialize an instance of RootType1InlineType1NestedInlineType1 to a JSON object
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
      obj.bar.is_a?(String) != false || raise("Passed value for field obj.bar is not the expected type, validation failed.")
      obj.my_enum.is_a?(SeedObjectClient::InlineEnum1) != false || raise("Passed value for field obj.my_enum is not the expected type, validation failed.")
      SeedObjectClient::ReferenceType.validate_raw(obj: obj.ref)
    end
  end
end
