# frozen_string_literal: true

require_relative "metadata"
require_relative "indexed_data"
require "ostruct"
require "json"

module SeedApiClient
  class QueryColumn
    # @return [Array<Float>]
    attr_reader :values
    # @return [Integer]
    attr_reader :top_k
    # @return [String]
    attr_reader :namespace
    # @return [SeedApiClient::Metadata]
    attr_reader :filter
    # @return [SeedApiClient::IndexedData]
    attr_reader :indexed_data
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param values [Array<Float>]
    # @param top_k [Integer]
    # @param namespace [String]
    # @param filter [SeedApiClient::Metadata]
    # @param indexed_data [SeedApiClient::IndexedData]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::QueryColumn]
    def initialize(values:, top_k: OMIT, namespace: OMIT, filter: OMIT, indexed_data: OMIT, additional_properties: nil)
      @values = values
      @top_k = top_k if top_k != OMIT
      @namespace = namespace if namespace != OMIT
      @filter = filter if filter != OMIT
      @indexed_data = indexed_data if indexed_data != OMIT
      @additional_properties = additional_properties
      @_field_set = {
        "values": values,
        "topK": top_k,
        "namespace": namespace,
        "filter": filter,
        "indexedData": indexed_data
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of QueryColumn
    #
    # @param json_object [String]
    # @return [SeedApiClient::QueryColumn]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      values = parsed_json["values"]
      top_k = parsed_json["topK"]
      namespace = parsed_json["namespace"]
      if parsed_json["filter"].nil?
        filter = nil
      else
        filter = parsed_json["filter"].to_json
        filter = SeedApiClient::Metadata.from_json(json_object: filter)
      end
      if parsed_json["indexedData"].nil?
        indexed_data = nil
      else
        indexed_data = parsed_json["indexedData"].to_json
        indexed_data = SeedApiClient::IndexedData.from_json(json_object: indexed_data)
      end
      new(
        values: values,
        top_k: top_k,
        namespace: namespace,
        filter: filter,
        indexed_data: indexed_data,
        additional_properties: struct
      )
    end

    # Serialize an instance of QueryColumn to a JSON object
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
      obj.values.is_a?(Array) != false || raise("Passed value for field obj.values is not the expected type, validation failed.")
      obj.top_k&.is_a?(Integer) != false || raise("Passed value for field obj.top_k is not the expected type, validation failed.")
      obj.namespace&.is_a?(String) != false || raise("Passed value for field obj.namespace is not the expected type, validation failed.")
      obj.filter.nil? || SeedApiClient::Metadata.validate_raw(obj: obj.filter)
      obj.indexed_data.nil? || SeedApiClient::IndexedData.validate_raw(obj: obj.indexed_data)
    end
  end
end
