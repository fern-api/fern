# frozen_string_literal: true

require_relative "usage"
require "ostruct"
require "json"

module SeedApiClient
  class FetchResponse
    # @return [Hash{String => SeedApiClient::Column}]
    attr_reader :columns
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

    # @param columns [Hash{String => SeedApiClient::Column}]
    # @param namespace [String]
    # @param usage [SeedApiClient::Usage]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::FetchResponse]
    def initialize(columns: OMIT, namespace: OMIT, usage: OMIT, additional_properties: nil)
      @columns = columns if columns != OMIT
      @namespace = namespace if namespace != OMIT
      @usage = usage if usage != OMIT
      @additional_properties = additional_properties
      @_field_set = { "columns": columns, "namespace": namespace, "usage": usage }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of FetchResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::FetchResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      columns = parsed_json["columns"]&.transform_values do |value|
        value = value.to_json
        SeedApiClient::Column.from_json(json_object: value)
      end
      namespace = parsed_json["namespace"]
      if parsed_json["usage"].nil?
        usage = nil
      else
        usage = parsed_json["usage"].to_json
        usage = SeedApiClient::Usage.from_json(json_object: usage)
      end
      new(
        columns: columns,
        namespace: namespace,
        usage: usage,
        additional_properties: struct
      )
    end

    # Serialize an instance of FetchResponse to a JSON object
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
      obj.columns&.is_a?(Hash) != false || raise("Passed value for field obj.columns is not the expected type, validation failed.")
      obj.namespace&.is_a?(String) != false || raise("Passed value for field obj.namespace is not the expected type, validation failed.")
      obj.usage.nil? || SeedApiClient::Usage.validate_raw(obj: obj.usage)
    end
  end
end
