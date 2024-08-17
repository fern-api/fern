# frozen_string_literal: true

require_relative "list_element"
require_relative "pagination"
require_relative "usage"
require "ostruct"
require "json"

module SeedApiClient
  class ListResponse
    # @return [Array<SeedApiClient::ListElement>]
    attr_reader :columns
    # @return [SeedApiClient::Pagination]
    attr_reader :pagination
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

    # @param columns [Array<SeedApiClient::ListElement>]
    # @param pagination [SeedApiClient::Pagination]
    # @param namespace [String]
    # @param usage [SeedApiClient::Usage]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::ListResponse]
    def initialize(columns: OMIT, pagination: OMIT, namespace: OMIT, usage: OMIT, additional_properties: nil)
      @columns = columns if columns != OMIT
      @pagination = pagination if pagination != OMIT
      @namespace = namespace if namespace != OMIT
      @usage = usage if usage != OMIT
      @additional_properties = additional_properties
      @_field_set = {
        "columns": columns,
        "pagination": pagination,
        "namespace": namespace,
        "usage": usage
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of ListResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::ListResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      columns = parsed_json["columns"]&.map do |item|
        item = item.to_json
        SeedApiClient::ListElement.from_json(json_object: item)
      end
      if parsed_json["pagination"].nil?
        pagination = nil
      else
        pagination = parsed_json["pagination"].to_json
        pagination = SeedApiClient::Pagination.from_json(json_object: pagination)
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
        pagination: pagination,
        namespace: namespace,
        usage: usage,
        additional_properties: struct
      )
    end

    # Serialize an instance of ListResponse to a JSON object
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
      obj.columns&.is_a?(Array) != false || raise("Passed value for field obj.columns is not the expected type, validation failed.")
      obj.pagination.nil? || SeedApiClient::Pagination.validate_raw(obj: obj.pagination)
      obj.namespace&.is_a?(String) != false || raise("Passed value for field obj.namespace is not the expected type, validation failed.")
      obj.usage.nil? || SeedApiClient::Usage.validate_raw(obj: obj.usage)
    end
  end
end
