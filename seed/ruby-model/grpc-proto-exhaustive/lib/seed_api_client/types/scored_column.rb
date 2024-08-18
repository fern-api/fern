# frozen_string_literal: true

require_relative "metadata"
require_relative "indexed_data"
require "ostruct"
require "json"

module SeedApiClient
  class ScoredColumn
    # @return [String]
    attr_reader :id
    # @return [Float]
    attr_reader :score
    # @return [Array<Float>]
    attr_reader :values
    # @return [SeedApiClient::Metadata]
    attr_reader :metadata
    # @return [SeedApiClient::IndexedData]
    attr_reader :indexed_data
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param id [String]
    # @param score [Float]
    # @param values [Array<Float>]
    # @param metadata [SeedApiClient::Metadata]
    # @param indexed_data [SeedApiClient::IndexedData]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::ScoredColumn]
    def initialize(id:, score: OMIT, values: OMIT, metadata: OMIT, indexed_data: OMIT, additional_properties: nil)
      @id = id
      @score = score if score != OMIT
      @values = values if values != OMIT
      @metadata = metadata if metadata != OMIT
      @indexed_data = indexed_data if indexed_data != OMIT
      @additional_properties = additional_properties
      @_field_set = {
        "id": id,
        "score": score,
        "values": values,
        "metadata": metadata,
        "indexedData": indexed_data
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of ScoredColumn
    #
    # @param json_object [String]
    # @return [SeedApiClient::ScoredColumn]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      id = parsed_json["id"]
      score = parsed_json["score"]
      values = parsed_json["values"]
      if parsed_json["metadata"].nil?
        metadata = nil
      else
        metadata = parsed_json["metadata"].to_json
        metadata = SeedApiClient::Metadata.from_json(json_object: metadata)
      end
      if parsed_json["indexedData"].nil?
        indexed_data = nil
      else
        indexed_data = parsed_json["indexedData"].to_json
        indexed_data = SeedApiClient::IndexedData.from_json(json_object: indexed_data)
      end
      new(
        id: id,
        score: score,
        values: values,
        metadata: metadata,
        indexed_data: indexed_data,
        additional_properties: struct
      )
    end

    # Serialize an instance of ScoredColumn to a JSON object
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
      obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
      obj.score&.is_a?(Float) != false || raise("Passed value for field obj.score is not the expected type, validation failed.")
      obj.values&.is_a?(Array) != false || raise("Passed value for field obj.values is not the expected type, validation failed.")
      obj.metadata.nil? || SeedApiClient::Metadata.validate_raw(obj: obj.metadata)
      obj.indexed_data.nil? || SeedApiClient::IndexedData.validate_raw(obj: obj.indexed_data)
    end
  end
end
