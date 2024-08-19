# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class DescribeResponse
    # @return [Hash{String => SeedApiClient::NamespaceSummary}]
    attr_reader :namespaces
    # @return [Integer]
    attr_reader :dimension
    # @return [Float]
    attr_reader :fullness
    # @return [Integer]
    attr_reader :total_count
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param namespaces [Hash{String => SeedApiClient::NamespaceSummary}]
    # @param dimension [Integer]
    # @param fullness [Float]
    # @param total_count [Integer]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::DescribeResponse]
    def initialize(namespaces: OMIT, dimension: OMIT, fullness: OMIT, total_count: OMIT, additional_properties: nil)
      @namespaces = namespaces if namespaces != OMIT
      @dimension = dimension if dimension != OMIT
      @fullness = fullness if fullness != OMIT
      @total_count = total_count if total_count != OMIT
      @additional_properties = additional_properties
      @_field_set = {
        "namespaces": namespaces,
        "dimension": dimension,
        "fullness": fullness,
        "totalCount": total_count
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of DescribeResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::DescribeResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      namespaces = parsed_json["namespaces"]&.transform_values do |value|
        value = value.to_json
        SeedApiClient::NamespaceSummary.from_json(json_object: value)
      end
      dimension = parsed_json["dimension"]
      fullness = parsed_json["fullness"]
      total_count = parsed_json["totalCount"]
      new(
        namespaces: namespaces,
        dimension: dimension,
        fullness: fullness,
        total_count: total_count,
        additional_properties: struct
      )
    end

    # Serialize an instance of DescribeResponse to a JSON object
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
      obj.namespaces&.is_a?(Hash) != false || raise("Passed value for field obj.namespaces is not the expected type, validation failed.")
      obj.dimension&.is_a?(Integer) != false || raise("Passed value for field obj.dimension is not the expected type, validation failed.")
      obj.fullness&.is_a?(Float) != false || raise("Passed value for field obj.fullness is not the expected type, validation failed.")
      obj.total_count&.is_a?(Integer) != false || raise("Passed value for field obj.total_count is not the expected type, validation failed.")
    end
  end
end
