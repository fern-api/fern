# frozen_string_literal: true

require "json"

module SeedClient
  module Literal
    class Options
      attr_reader :id, :enabled, :values, :additional_properties

      # @param id [String]
      # @param enabled [Boolean]
      # @param values [Hash{String => String}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Literal::Options]
      def initialze(id:, enabled:, values:, additional_properties: nil)
        # @type [String]
        @id = id
        # @type [Boolean]
        @enabled = enabled
        # @type [Hash{String => String}]
        @values = values
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Options
      #
      # @param json_object [JSON]
      # @return [Literal::Options]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id struct.id
        enabled struct.enabled
        values struct.values
        new(id: id, enabled: enabled, values: values, additional_properties: struct)
      end

      # Serialize an instance of Options to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { id: @id, enabled: @enabled, values: @values }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.enabled.is_a?(Boolean) != false || raise("Passed value for field obj.enabled is not the expected type, validation failed.")
        obj.values.is_a?(Hash) != false || raise("Passed value for field obj.values is not the expected type, validation failed.")
      end
    end
  end
end
