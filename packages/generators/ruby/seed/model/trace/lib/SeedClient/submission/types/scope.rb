# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class Scope
      attr_reader :variables, :additional_properties

      # @param variables [Hash{String => String}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::Scope]
      def initialze(variables:, additional_properties: nil)
        # @type [Hash{String => String}]
        @variables = variables
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Scope
      #
      # @param json_object [JSON]
      # @return [Submission::Scope]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        variables struct.variables
        new(variables: variables, additional_properties: struct)
      end

      # Serialize an instance of Scope to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { variables: @variables }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.variables.is_a?(Hash) != false || raise("Passed value for field obj.variables is not the expected type, validation failed.")
      end
    end
  end
end
