# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExtendsClient
  class ExampleType
    # @return [String]
    attr_reader :name
    # @return [String]
    attr_reader :docs
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param name [String]
    # @param docs [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedExtendsClient::ExampleType]
    def initialize(name:, docs:, additional_properties: nil)
      @name = name
      @docs = docs
      @additional_properties = additional_properties
      @_field_set = { "name": name, "docs": docs }
    end

    # Deserialize a JSON object to an instance of ExampleType
    #
    # @param json_object [String]
    # @return [SeedExtendsClient::ExampleType]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      name = parsed_json["name"]
      docs = parsed_json["docs"]
      new(
        name: name,
        docs: docs,
        additional_properties: struct
      )
    end

    # Serialize an instance of ExampleType to a JSON object
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
      obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      obj.docs.is_a?(String) != false || raise("Passed value for field obj.docs is not the expected type, validation failed.")
    end
  end
end
