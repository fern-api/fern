# frozen_string_literal: true

require_relative "scored_column"
require "ostruct"
require "json"

module SeedApiClient
  class QueryResult
    # @return [Array<SeedApiClient::ScoredColumn>]
    attr_reader :matches
    # @return [String]
    attr_reader :namespace
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param matches [Array<SeedApiClient::ScoredColumn>]
    # @param namespace [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::QueryResult]
    def initialize(matches: OMIT, namespace: OMIT, additional_properties: nil)
      @matches = matches if matches != OMIT
      @namespace = namespace if namespace != OMIT
      @additional_properties = additional_properties
      @_field_set = { "matches": matches, "namespace": namespace }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of QueryResult
    #
    # @param json_object [String]
    # @return [SeedApiClient::QueryResult]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      matches = parsed_json["matches"]&.map do |item|
        item = item.to_json
        SeedApiClient::ScoredColumn.from_json(json_object: item)
      end
      namespace = parsed_json["namespace"]
      new(
        matches: matches,
        namespace: namespace,
        additional_properties: struct
      )
    end

    # Serialize an instance of QueryResult to a JSON object
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
      obj.matches&.is_a?(Array) != false || raise("Passed value for field obj.matches is not the expected type, validation failed.")
      obj.namespace&.is_a?(String) != false || raise("Passed value for field obj.namespace is not the expected type, validation failed.")
    end
  end
end
