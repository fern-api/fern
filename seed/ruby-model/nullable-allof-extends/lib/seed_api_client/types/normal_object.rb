# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  # A standard object with no nullable issues.
  class NormalObject
    # @return [String]
    attr_reader :normal_field
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param normal_field [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::NormalObject]
    def initialize(normal_field: OMIT, additional_properties: nil)
      @normal_field = normal_field if normal_field != OMIT
      @additional_properties = additional_properties
      @_field_set = { "normalField": normal_field }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of NormalObject
    #
    # @param json_object [String]
    # @return [SeedApiClient::NormalObject]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      normal_field = parsed_json["normalField"]
      new(normal_field: normal_field, additional_properties: struct)
    end

    # Serialize an instance of NormalObject to a JSON object
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
    end
  end
end
