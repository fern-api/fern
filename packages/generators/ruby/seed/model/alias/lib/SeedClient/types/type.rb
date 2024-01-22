# frozen_string_literal: true

require_relative "types/TYPE_ID"
require "json"

module SeedClient
  # A simple type with just a name.
  class Type
    attr_reader :id, :name, :additional_properties

    # @param id [TYPE_ID]
    # @param name [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Type]
    def initialze(id:, name:, additional_properties: nil)
      # @type [TYPE_ID]
      @id = id
      # @type [String]
      @name = name
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Type
    #
    # @param json_object [JSON]
    # @return [Type]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      id = struct.id
      name = struct.name
      new(id: id, name: name, additional_properties: struct)
    end

    # Serialize an instance of Type to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { "id": @id, "name": @name }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
    end
  end
end
