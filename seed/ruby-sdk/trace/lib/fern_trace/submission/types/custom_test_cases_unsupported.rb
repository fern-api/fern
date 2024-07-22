# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class CustomTestCasesUnsupported
      # @return [String]
      attr_reader :problem_id
      # @return [String]
      attr_reader :submission_id
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param problem_id [String]
      # @param submission_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::CustomTestCasesUnsupported]
      def initialize(problem_id:, submission_id:, additional_properties: nil)
        @problem_id = problem_id
        @submission_id = submission_id
        @additional_properties = additional_properties
        @_field_set = { "problemId": problem_id, "submissionId": submission_id }
      end

      # Deserialize a JSON object to an instance of CustomTestCasesUnsupported
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::CustomTestCasesUnsupported]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        problem_id = parsed_json["problemId"]
        submission_id = parsed_json["submissionId"]
        new(
          problem_id: problem_id,
          submission_id: submission_id,
          additional_properties: struct
        )
      end

      # Serialize an instance of CustomTestCasesUnsupported to a JSON object
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
        obj.submission_id.is_a?(String) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
      end
    end
  end
end
