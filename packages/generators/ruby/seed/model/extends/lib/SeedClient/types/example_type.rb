# frozen_string_literal: true

require "json"

module SeedClient
  class ExampleType
    attr_reader :name, :docs, :additional_properties

    # @param name [String]
    # @param docs [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [ExampleType]
    def initialize(name:, docs:, additional_properties: nil)
      # @type [String]
      @name = name
      # @type [String]
      @docs = docs
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of ExampleType
    #
    # @param json_object [JSON]
    # @return [ExampleType]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      name = struct.name
      docs = struct.docs
      new(name: name, docs: docs, additional_properties: struct)
    end

    # Serialize an instance of ExampleType to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { "name": @name, "docs": @docs }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      obj.docs.is_a?(String) != false || raise("Passed value for field obj.docs is not the expected type, validation failed.")
    end
  end
end
