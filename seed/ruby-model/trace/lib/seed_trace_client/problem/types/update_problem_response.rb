# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Problem
    class UpdateProblemResponse
      attr_reader :problem_version, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param problem_version [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Problem::UpdateProblemResponse]
      def initialize(problem_version:, additional_properties: nil)
        # @type [Integer]
        @problem_version = problem_version
        @_field_set = { "problemVersion": @problem_version }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of UpdateProblemResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Problem::UpdateProblemResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_version = struct["problemVersion"]
        new(problem_version: problem_version, additional_properties: struct)
      end

      # Serialize an instance of UpdateProblemResponse to a JSON object
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
        obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
      end
    end
  end
end
