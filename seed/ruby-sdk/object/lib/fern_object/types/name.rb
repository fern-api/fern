# frozen_string_literal: true

require "ostruct"
require "json"

module SeedObjectClient
  class Name
    attr_reader :id, :value, :additional_properties, :_field_set
    protected :_field_set
    OMIT = Object.new
    # @param id [String]
    # @param value [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedObjectClient::Name]
    def initialize(id:, value:, additional_properties: nil)
      # @type [String]
      @id = id
      # @type [String]
      @value = value
      @_field_set = { "id": @id, "value": @value }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of Name
    #
    # @param json_object [String]
    # @return [SeedObjectClient::Name]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      id = struct["id"]
      value = struct["value"]
      new(id: id, value: value, additional_properties: struct)
    end

    # Serialize an instance of Name to a JSON object
    #
    # @return [String]
    def to_json(*_args)
      @_field_set&.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      obj.value.is_a?(String) != false || raise("Passed value for field obj.value is not the expected type, validation failed.")
    end
  end
end
