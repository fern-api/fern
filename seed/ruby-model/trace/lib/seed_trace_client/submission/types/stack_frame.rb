# frozen_string_literal: true

require_relative "scope"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class StackFrame
      # @return [String]
      attr_reader :method_name
      # @return [Integer]
      attr_reader :line_number
      # @return [Array<SeedTraceClient::Submission::Scope>]
      attr_reader :scopes
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param method_name [String]
      # @param line_number [Integer]
      # @param scopes [Array<SeedTraceClient::Submission::Scope>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::StackFrame]
      def initialize(method_name:, line_number:, scopes:, additional_properties: nil)
        @method_name = method_name
        @line_number = line_number
        @scopes = scopes
        @additional_properties = additional_properties
        @_field_set = { "methodName": method_name, "lineNumber": line_number, "scopes": scopes }
      end

      # Deserialize a JSON object to an instance of StackFrame
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::StackFrame]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        method_name = parsed_json["methodName"]
        line_number = parsed_json["lineNumber"]
        scopes = parsed_json["scopes"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Submission::Scope.from_json(json_object: item)
        end
        new(
          method_name: method_name,
          line_number: line_number,
          scopes: scopes,
          additional_properties: struct
        )
      end

      # Serialize an instance of StackFrame to a JSON object
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
        obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
        obj.line_number.is_a?(Integer) != false || raise("Passed value for field obj.line_number is not the expected type, validation failed.")
        obj.scopes.is_a?(Array) != false || raise("Passed value for field obj.scopes is not the expected type, validation failed.")
      end
    end
  end
end
