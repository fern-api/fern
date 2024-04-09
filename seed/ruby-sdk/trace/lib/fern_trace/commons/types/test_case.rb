# frozen_string_literal: true

require_relative "variable_value"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class TestCase
      attr_reader :id, :params, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param id [String]
      # @param params [Array<SeedTraceClient::Commons::VariableValue>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::TestCase]
      def initialize(id:, params:, additional_properties: nil)
        # @type [String]
        @id = id
        # @type [Array<SeedTraceClient::Commons::VariableValue>]
        @params = params
        @_field_set = { "id": @id, "params": @params }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of TestCase
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::TestCase]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = struct["id"]
        params = parsed_json["params"]&.map do |v|
          v = v.to_json
          SeedTraceClient::Commons::VariableValue.from_json(json_object: v)
        end
        new(id: id, params: params, additional_properties: struct)
      end

      # Serialize an instance of TestCase to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.params.is_a?(Array) != false || raise("Passed value for field obj.params is not the expected type, validation failed.")
      end
    end
  end
end
