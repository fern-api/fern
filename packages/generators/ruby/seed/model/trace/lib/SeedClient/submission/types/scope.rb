# frozen_string_literal: true

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
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Scope
      #
      # @param json_object [JSON]
      # @return [Submission::Scope]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        variables = struct.variables
        new(variables: variables, additional_properties: struct)
      end

      # Serialize an instance of Scope to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          variables: @variables
        }.to_json
      end
    end
  end
end
