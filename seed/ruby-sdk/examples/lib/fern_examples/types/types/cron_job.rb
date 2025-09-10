# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class CronJob
      # @return [String]
      attr_reader :expression
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param expression [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::CronJob]
      def initialize(expression:, additional_properties: nil)
        @expression = expression
        @additional_properties = additional_properties
        @_field_set = { "expression": expression }
      end

      # Deserialize a JSON object to an instance of CronJob
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::CronJob]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        expression = parsed_json["expression"]
        new(expression: expression, additional_properties: struct)
      end

      # Serialize an instance of CronJob to a JSON object
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
        obj.expression.is_a?(String) != false || raise("Passed value for field obj.expression is not the expected type, validation failed.")
      end
    end
  end
end
