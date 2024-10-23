# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class Scope
      # @return [Hash{String => SeedTraceClient::Commons::DebugVariableValue}]
      attr_reader :variables
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param variables [Hash{String => SeedTraceClient::Commons::DebugVariableValue}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::Scope]
      def initialize(variables:, additional_properties: nil)
        @variables = variables
        @additional_properties = additional_properties
        @_field_set = { "variables": variables }
      end

      # Deserialize a JSON object to an instance of Scope
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::Scope]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        variables = parsed_json["variables"]&.transform_values do |value|
          value = value.to_json
          SeedTraceClient::Commons::DebugVariableValue.from_json(json_object: value)
        end
        new(variables: variables, additional_properties: struct)
      end

      # Serialize an instance of Scope to a JSON object
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
        obj.variables.is_a?(Hash) != false || raise("Passed value for field obj.variables is not the expected type, validation failed.")
      end
    end
  end
end
