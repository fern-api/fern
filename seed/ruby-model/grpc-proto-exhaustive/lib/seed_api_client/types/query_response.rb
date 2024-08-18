# frozen_string_literal: true

require_relative "query_result"
require_relative "scored_column"
require_relative "usage"
require "ostruct"
require "json"

module SeedApiClient
  class QueryResponse
    # @return [Array<SeedApiClient::QueryResult>]
    attr_reader :results
    # @return [Array<SeedApiClient::ScoredColumn>]
    attr_reader :matches
    # @return [String]
    attr_reader :namespace
    # @return [SeedApiClient::Usage]
    attr_reader :usage
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param results [Array<SeedApiClient::QueryResult>]
    # @param matches [Array<SeedApiClient::ScoredColumn>]
    # @param namespace [String]
    # @param usage [SeedApiClient::Usage]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::QueryResponse]
    def initialize(results: OMIT, matches: OMIT, namespace: OMIT, usage: OMIT, additional_properties: nil)
      @results = results if results != OMIT
      @matches = matches if matches != OMIT
      @namespace = namespace if namespace != OMIT
      @usage = usage if usage != OMIT
      @additional_properties = additional_properties
      @_field_set = {
        "results": results,
        "matches": matches,
        "namespace": namespace,
        "usage": usage
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of QueryResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::QueryResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      results = parsed_json["results"]&.map do |item|
        item = item.to_json
        SeedApiClient::QueryResult.from_json(json_object: item)
      end
      matches = parsed_json["matches"]&.map do |item|
        item = item.to_json
        SeedApiClient::ScoredColumn.from_json(json_object: item)
      end
      namespace = parsed_json["namespace"]
      if parsed_json["usage"].nil?
        usage = nil
      else
        usage = parsed_json["usage"].to_json
        usage = SeedApiClient::Usage.from_json(json_object: usage)
      end
      new(
        results: results,
        matches: matches,
        namespace: namespace,
        usage: usage,
        additional_properties: struct
      )
    end

    # Serialize an instance of QueryResponse to a JSON object
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
      obj.results&.is_a?(Array) != false || raise("Passed value for field obj.results is not the expected type, validation failed.")
      obj.matches&.is_a?(Array) != false || raise("Passed value for field obj.matches is not the expected type, validation failed.")
      obj.namespace&.is_a?(String) != false || raise("Passed value for field obj.namespace is not the expected type, validation failed.")
      obj.usage.nil? || SeedApiClient::Usage.validate_raw(obj: obj.usage)
    end
  end
end
