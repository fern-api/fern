# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExtraPropertiesClient
  class Failure
    # @return [String]
    attr_reader :status
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param status [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedExtraPropertiesClient::Failure]
    def initialize(status:, additional_properties: nil)
      @status = status
      @additional_properties = additional_properties
      @_field_set = { "status": status }
    end

    # Deserialize a JSON object to an instance of Failure
    #
    # @param json_object [String]
    # @return [SeedExtraPropertiesClient::Failure]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      status = parsed_json["status"]
      new(status: status, additional_properties: struct)
    end

    # Serialize an instance of Failure to a JSON object
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
      obj.status.is_a?(String) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
    end
  end
end
