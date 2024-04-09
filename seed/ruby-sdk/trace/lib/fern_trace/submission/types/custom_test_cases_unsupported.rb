# frozen_string_literal: true

require_relative "../../commons/types/problem_id"
require_relative "submission_id"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class CustomTestCasesUnsupported
      attr_reader :problem_id, :submission_id, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param problem_id [SeedTraceClient::Commons::PROBLEM_ID]
      # @param submission_id [SeedTraceClient::Submission::SUBMISSION_ID]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::CustomTestCasesUnsupported]
      def initialize(problem_id:, submission_id:, additional_properties: nil)
        # @type [SeedTraceClient::Commons::PROBLEM_ID]
        @problem_id = problem_id
        # @type [SeedTraceClient::Submission::SUBMISSION_ID]
        @submission_id = submission_id
        @_field_set = { "problemId": @problem_id, "submissionId": @submission_id }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of CustomTestCasesUnsupported
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::CustomTestCasesUnsupported]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_id = struct["problemId"]
        submission_id = struct["submissionId"]
        new(problem_id: problem_id, submission_id: submission_id, additional_properties: struct)
      end

      # Serialize an instance of CustomTestCasesUnsupported to a JSON object
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
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.submission_id.is_a?(String) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
      end
    end
  end
end
