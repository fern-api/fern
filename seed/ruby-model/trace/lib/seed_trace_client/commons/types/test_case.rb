# frozen_string_literal: true

require_relative "variable_value"
require "json"

module SeedTraceClient
  module Commons
    class TestCase
      attr_reader :id, :params, :additional_properties

      # @param id [String]
      # @param params [Array<Commons::VariableValue>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::TestCase]
      def initialize(id:, params:, additional_properties: nil)
        # @type [String]
        @id = id
        # @type [Array<Commons::VariableValue>]
        @params = params
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestCase
      #
      # @param json_object [JSON]
      # @return [Commons::TestCase]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct.id
        params = struct.params
        new(id: id, params: params, additional_properties: struct)
      end

      # Serialize an instance of TestCase to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "id": @id, "params": @params }.to_json
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
