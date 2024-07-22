# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class InitializeProblemRequest
      # @return [String]
      attr_reader :problem_id
      # @return [Integer]
      attr_reader :problem_version
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param problem_id [String]
      # @param problem_version [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::InitializeProblemRequest]
      def initialize(problem_id:, problem_version: OMIT, additional_properties: nil)
        @problem_id = problem_id
        @problem_version = problem_version if problem_version != OMIT
        @additional_properties = additional_properties
        @_field_set = { "problemId": problem_id, "problemVersion": problem_version }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of InitializeProblemRequest
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::InitializeProblemRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        problem_id = parsed_json["problemId"]
        problem_version = parsed_json["problemVersion"]
        new(
          problem_id: problem_id,
          problem_version: problem_version,
          additional_properties: struct
        )
      end

      # Serialize an instance of InitializeProblemRequest to a JSON object
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
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.problem_version&.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
      end
    end
  end
end
