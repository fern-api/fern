# frozen_string_literal: true

require_relative "root_type_1_inline_type_1"
require_relative "root_type_1_foo_list_item"
require "set"
require_relative "reference_type"
require "ostruct"
require "json"

module SeedObjectClient
  # lorem ipsum
  class RootType1
    # @return [String] lorem ipsum
    attr_reader :foo
    # @return [SeedObjectClient::RootType1InlineType1] lorem ipsum
    attr_reader :bar
    # @return [Hash{String => SeedObjectClient::RootType1FooMapValue}] lorem ipsum
    attr_reader :foo_map
    # @return [Array<SeedObjectClient::RootType1FooListItem>] lorem ipsum
    attr_reader :foo_list
    # @return [Set<SeedObjectClient::RootType1FooSetItem>] lorem ipsum
    attr_reader :foo_set
    # @return [SeedObjectClient::ReferenceType] lorem ipsum
    attr_reader :ref
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param foo [String] lorem ipsum
    # @param bar [SeedObjectClient::RootType1InlineType1] lorem ipsum
    # @param foo_map [Hash{String => SeedObjectClient::RootType1FooMapValue}] lorem ipsum
    # @param foo_list [Array<SeedObjectClient::RootType1FooListItem>] lorem ipsum
    # @param foo_set [Set<SeedObjectClient::RootType1FooSetItem>] lorem ipsum
    # @param ref [SeedObjectClient::ReferenceType] lorem ipsum
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedObjectClient::RootType1]
    def initialize(foo:, bar:, foo_map:, foo_list:, foo_set:, ref:, additional_properties: nil)
      @foo = foo
      @bar = bar
      @foo_map = foo_map
      @foo_list = foo_list
      @foo_set = foo_set
      @ref = ref
      @additional_properties = additional_properties
      @_field_set = { "foo": foo, "bar": bar, "fooMap": foo_map, "fooList": foo_list, "fooSet": foo_set, "ref": ref }
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
        bar = SeedObjectClient::RootType1InlineType1.from_json(json_object: bar)
      end
      foo_map = parsed_json["fooMap"]&.transform_values do |value|
        value = value.to_json
        SeedObjectClient::RootType1FooMapValue.from_json(json_object: value)
      end
      foo_list = parsed_json["fooList"]&.map do |item|
        item = item.to_json
        SeedObjectClient::RootType1FooListItem.from_json(json_object: item)
      end
      if parsed_json["fooSet"].nil?
        foo_set = nil
      else
        foo_set = parsed_json["fooSet"].to_json
        foo_set = Set.new(foo_set)
      end
      if parsed_json["ref"].nil?
        ref = nil
      else
        ref = parsed_json["ref"].to_json
        ref = SeedObjectClient::ReferenceType.from_json(json_object: ref)
      end
      new(
        foo: foo,
        bar: bar,
        foo_map: foo_map,
        foo_list: foo_list,
        foo_set: foo_set,
        ref: ref,
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
      SeedObjectClient::RootType1InlineType1.validate_raw(obj: obj.bar)
      obj.foo_map.is_a?(Hash) != false || raise("Passed value for field obj.foo_map is not the expected type, validation failed.")
      obj.foo_list.is_a?(Array) != false || raise("Passed value for field obj.foo_list is not the expected type, validation failed.")
      obj.foo_set.is_a?(Set) != false || raise("Passed value for field obj.foo_set is not the expected type, validation failed.")
      SeedObjectClient::ReferenceType.validate_raw(obj: obj.ref)
    end
  end
end
