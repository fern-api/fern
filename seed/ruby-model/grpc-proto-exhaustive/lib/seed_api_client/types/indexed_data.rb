# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class IndexedData
    # @return [Array<Integer>]
    attr_reader :indices
    # @return [Array<Float>]
    attr_reader :values
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param indices [Array<Integer>]
    # @param values [Array<Float>]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::IndexedData]
    def initialize(indices:, values:, additional_properties: nil)
      @indices = indices
      @values = values
      @additional_properties = additional_properties
      @_field_set = { "indices": indices, "values": values }
    end

    # Deserialize a JSON object to an instance of IndexedData
    #
    # @param json_object [String]
    # @return [SeedApiClient::IndexedData]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      indices = parsed_json["indices"]
      values = parsed_json["values"]
      new(
        indices: indices,
        values: values,
        additional_properties: struct
      )
    end

    # Serialize an instance of IndexedData to a JSON object
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
      obj.indices.is_a?(Array) != false || raise("Passed value for field obj.indices is not the expected type, validation failed.")
      obj.values.is_a?(Array) != false || raise("Passed value for field obj.values is not the expected type, validation failed.")
    end
  end
end
