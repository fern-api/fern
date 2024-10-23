# frozen_string_literal: true

require_relative "../../commons/types/variable_type"
require "ostruct"
require "json"

module SeedTraceClient
  class Problem
    class VariableTypeAndName
      # @return [SeedTraceClient::Commons::VariableType]
      attr_reader :variable_type
      # @return [String]
      attr_reader :name
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param variable_type [SeedTraceClient::Commons::VariableType]
      # @param name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Problem::VariableTypeAndName]
      def initialize(variable_type:, name:, additional_properties: nil)
        @variable_type = variable_type
        @name = name
        @additional_properties = additional_properties
        @_field_set = { "variableType": variable_type, "name": name }
      end

      # Deserialize a JSON object to an instance of VariableTypeAndName
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Problem::VariableTypeAndName]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["variableType"].nil?
          variable_type = nil
        else
          variable_type = parsed_json["variableType"].to_json
          variable_type = SeedTraceClient::Commons::VariableType.from_json(json_object: variable_type)
        end
        name = parsed_json["name"]
        new(
          variable_type: variable_type,
          name: name,
          additional_properties: struct
        )
      end

      # Serialize an instance of VariableTypeAndName to a JSON object
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
        SeedTraceClient::Commons::VariableType.validate_raw(obj: obj.variable_type)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      end
    end
  end
end
