# frozen_string_literal: true

require "ostruct"
require "json"

module SeedUndiscriminatedUnionWithResponsePropertyClient
  class VariantA
    # @return [String]
    attr_reader :type
    # @return [String]
    attr_reader :value_a
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param type [String]
    # @param value_a [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedUndiscriminatedUnionWithResponsePropertyClient::VariantA]
    def initialize(type:, value_a:, additional_properties: nil)
      @type = type
      @value_a = value_a
      @additional_properties = additional_properties
      @_field_set = { "type": type, "valueA": value_a }
    end

    # Deserialize a JSON object to an instance of VariantA
    #
    # @param json_object [String]
    # @return [SeedUndiscriminatedUnionWithResponsePropertyClient::VariantA]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      type = parsed_json["type"]
      value_a = parsed_json["valueA"]
      new(
        type: type,
        value_a: value_a,
        additional_properties: struct
      )
    end

    # Serialize an instance of VariantA to a JSON object
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
      obj.type.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
      obj.value_a.is_a?(String) != false || raise("Passed value for field obj.value_a is not the expected type, validation failed.")
    end
  end
end
