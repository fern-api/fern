# frozen_string_literal: true

require_relative "test_submission_update"
require_relative "../../commons/types/problem_id"
require_relative "../../v_2/problem/types/problem_info_v_2"
require "json"

module SeedTraceClient
  module Submission
    class TestSubmissionStatusV2
      attr_reader :updates, :problem_id, :problem_version, :problem_info, :additional_properties

      # @param updates [Array<Submission::TestSubmissionUpdate>]
      # @param problem_id [Commons::PROBLEM_ID]
      # @param problem_version [Integer]
      # @param problem_info [V2::Problem::ProblemInfoV2]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestSubmissionStatusV2]
      def initialize(updates:, problem_id:, problem_version:, problem_info:, additional_properties: nil)
        # @type [Array<Submission::TestSubmissionUpdate>]
        @updates = updates
        # @type [Commons::PROBLEM_ID]
        @problem_id = problem_id
        # @type [Integer]
        @problem_version = problem_version
        # @type [V2::Problem::ProblemInfoV2]
        @problem_info = problem_info
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestSubmissionStatusV2
      #
      # @param json_object [JSON]
      # @return [Submission::TestSubmissionStatusV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        updates = struct.updates
        problem_id = struct.problemId
        problem_version = struct.problemVersion
        problem_info = struct.problemInfo
        new(updates: updates, problem_id: problem_id, problem_version: problem_version, problem_info: problem_info,
            additional_properties: struct)
      end

      # Serialize an instance of TestSubmissionStatusV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          "updates": @updates,
          "problemId": @problem_id,
          "problemVersion": @problem_version,
          "problemInfo": @problem_info
        }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.updates.is_a?(Array) != false || raise("Passed value for field obj.updates is not the expected type, validation failed.")
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
        V2::Problem::ProblemInfoV2.validate_raw(obj: obj.problem_info)
      end
    end
  end
end
