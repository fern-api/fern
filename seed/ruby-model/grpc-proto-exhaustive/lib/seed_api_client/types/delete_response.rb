# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class DeleteResponse
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::DeleteResponse]
    def initialize(additional_properties: nil)
      @additional_properties = additional_properties
      @_field_set = {}
    end

    # Deserialize a JSON object to an instance of DeleteResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::DeleteResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      new(additional_properties: struct)
    end

    # Serialize an instance of DeleteResponse to a JSON object
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
    def self.validate_raw(obj:); end
  end
end
