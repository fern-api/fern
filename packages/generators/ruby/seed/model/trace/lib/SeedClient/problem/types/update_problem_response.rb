# frozen_string_literal: true

require "json"

module SeedClient
  module Problem
    class UpdateProblemResponse
      attr_reader :problem_version, :additional_properties

      # @param problem_version [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::UpdateProblemResponse]
      def initialze(problem_version:, additional_properties: nil)
        # @type [Integer]
        @problem_version = problem_version
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of UpdateProblemResponse
      #
      # @param json_object [JSON]
      # @return [Problem::UpdateProblemResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_version = struct.problemVersion
        new(problem_version: problem_version, additional_properties: struct)
      end

      # Serialize an instance of UpdateProblemResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "problemVersion": @problem_version }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
      end
    end
  end
end
