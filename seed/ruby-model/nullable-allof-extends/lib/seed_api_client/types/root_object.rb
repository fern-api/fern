# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  # Object inheriting from a nullable schema via allOf.
  class RootObject
    # @return [String]
    attr_reader :normal_field
    # @return [String]
    attr_reader :nullable_field
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param normal_field [String]
    # @param nullable_field [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::RootObject]
    def initialize(normal_field: OMIT, nullable_field: OMIT, additional_properties: nil)
      @normal_field = normal_field if normal_field != OMIT
      @nullable_field = nullable_field if nullable_field != OMIT
      @additional_properties = additional_properties
      @_field_set = { "normalField": normal_field, "nullableField": nullable_field }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of RootObject
    #
    # @param json_object [String]
    # @return [SeedApiClient::RootObject]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      normal_field = parsed_json["normalField"]
      nullable_field = parsed_json["nullableField"]
      new(
        normal_field: normal_field,
        nullable_field: nullable_field,
        additional_properties: struct
      )
    end

    # Serialize an instance of RootObject to a JSON object
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
      obj.normal_field&.is_a?(String) != false || raise("Passed value for field obj.normal_field is not the expected type, validation failed.")
      obj.nullable_field&.is_a?(String) != false || raise("Passed value for field obj.nullable_field is not the expected type, validation failed.")
    end
  end
end
