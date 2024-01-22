# frozen_string_literal: true

require_relative "commons/types/ProblemId"
require_relative "submission/types/SubmissionId"
require "json"

module SeedClient
  module Submission
    class CustomTestCasesUnsupported
      attr_reader :problem_id, :submission_id, :additional_properties

      # @param problem_id [Commons::ProblemId]
      # @param submission_id [Submission::SubmissionId]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::CustomTestCasesUnsupported]
      def initialze(problem_id:, submission_id:, additional_properties: nil)
        # @type [Commons::ProblemId]
        @problem_id = problem_id
        # @type [Submission::SubmissionId]
        @submission_id = submission_id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of CustomTestCasesUnsupported
      #
      # @param json_object [JSON]
      # @return [Submission::CustomTestCasesUnsupported]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_id Commons::ProblemId.from_json(json_object: struct.problemId)
        submission_id Submission::SubmissionId.from_json(json_object: struct.submissionId)
        new(problem_id: problem_id, submission_id: submission_id, additional_properties: struct)
      end

      # Serialize an instance of CustomTestCasesUnsupported to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { problemId: @problem_id, submissionId: @submission_id }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        ProblemId.validate_raw(obj: obj.problem_id)
        SubmissionId.validate_raw(obj: obj.submission_id)
      end
    end
  end
end
