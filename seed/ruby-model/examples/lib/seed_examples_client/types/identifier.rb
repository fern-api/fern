# frozen_string_literal: true

require_relative "type"
require "ostruct"
require "json"

module SeedExamplesClient
  class Identifier
    # @return [SeedExamplesClient::Type]
    attr_reader :type
    # @return [String]
    attr_reader :value
    # @return [String]
    attr_reader :label
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param type [SeedExamplesClient::Type]
    # @param value [String]
    # @param label [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedExamplesClient::Identifier]
    def initialize(type:, value:, label:, additional_properties: nil)
      @type = type
      @value = value
      @label = label
      @additional_properties = additional_properties
      @_field_set = { "type": type, "value": value, "label": label }
    end

    # Deserialize a JSON object to an instance of Identifier
    #
    # @param json_object [String]
    # @return [SeedExamplesClient::Identifier]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      if parsed_json["type"].nil?
        type = nil
      else
        type = parsed_json["type"].to_json
        type = SeedExamplesClient::Type.from_json(json_object: type)
      end
      value = parsed_json["value"]
      label = parsed_json["label"]
      new(
        type: type,
        value: value,
        label: label,
        additional_properties: struct
      )
    end

    # Serialize an instance of Identifier to a JSON object
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
      SeedExamplesClient::Type.validate_raw(obj: obj.type)
      obj.value.is_a?(String) != false || raise("Passed value for field obj.value is not the expected type, validation failed.")
      obj.label.is_a?(String) != false || raise("Passed value for field obj.label is not the expected type, validation failed.")
    end
  end
end
