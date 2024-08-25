# frozen_string_literal: true

require_relative "test_submission_update"
require_relative "../../v_2/problem/types/problem_info_v_2"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TestSubmissionStatusV2
      # @return [Array<SeedTraceClient::Submission::TestSubmissionUpdate>]
      attr_reader :updates
      # @return [String]
      attr_reader :problem_id
      # @return [Integer]
      attr_reader :problem_version
      # @return [SeedTraceClient::V2::Problem::ProblemInfoV2]
      attr_reader :problem_info
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param updates [Array<SeedTraceClient::Submission::TestSubmissionUpdate>]
      # @param problem_id [String]
      # @param problem_version [Integer]
      # @param problem_info [SeedTraceClient::V2::Problem::ProblemInfoV2]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TestSubmissionStatusV2]
      def initialize(updates:, problem_id:, problem_version:, problem_info:, additional_properties: nil)
        @updates = updates
        @problem_id = problem_id
        @problem_version = problem_version
        @problem_info = problem_info
        @additional_properties = additional_properties
        @_field_set = {
          "updates": updates,
          "problemId": problem_id,
          "problemVersion": problem_version,
          "problemInfo": problem_info
        }
      end

      # Deserialize a JSON object to an instance of TestSubmissionStatusV2
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TestSubmissionStatusV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        updates = parsed_json["updates"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Submission::TestSubmissionUpdate.from_json(json_object: item)
        end
        problem_id = parsed_json["problemId"]
        problem_version = parsed_json["problemVersion"]
        if parsed_json["problemInfo"].nil?
          problem_info = nil
        else
          problem_info = parsed_json["problemInfo"].to_json
          problem_info = SeedTraceClient::V2::Problem::ProblemInfoV2.from_json(json_object: problem_info)
        end
        new(
          updates: updates,
          problem_id: problem_id,
          problem_version: problem_version,
          problem_info: problem_info,
          additional_properties: struct
        )
      end

      # Serialize an instance of TestSubmissionStatusV2 to a JSON object
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
        obj.updates.is_a?(Array) != false || raise("Passed value for field obj.updates is not the expected type, validation failed.")
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
        SeedTraceClient::V2::Problem::ProblemInfoV2.validate_raw(obj: obj.problem_info)
      end
    end
  end
end
