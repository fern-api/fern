# frozen_string_literal: true
require "submission/types/TestSubmissionUpdate"
require "commons/types/ProblemId"
require "v_2/problem/types/ProblemInfoV2"
require "json"

module SeedClient
  module Submission
    class TestSubmissionStatusV2
      attr_reader :updates, :problem_id, :problem_version, :problem_info, :additional_properties
      # @param updates [Array<Submission::TestSubmissionUpdate>] 
      # @param problem_id [Commons::ProblemId] 
      # @param problem_version [Integer] 
      # @param problem_info [V2::Problem::ProblemInfoV2] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestSubmissionStatusV2] 
      def initialze(updates:, problem_id:, problem_version:, problem_info:, additional_properties: nil)
        # @type [Array<Submission::TestSubmissionUpdate>] 
        @updates = updates
        # @type [Commons::ProblemId] 
        @problem_id = problem_id
        # @type [Integer] 
        @problem_version = problem_version
        # @type [V2::Problem::ProblemInfoV2] 
        @problem_info = problem_info
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of TestSubmissionStatusV2
      #
      # @param json_object [JSON] 
      # @return [Submission::TestSubmissionStatusV2] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        updates = struct.updates.map() do | v |
 Submission::TestSubmissionUpdate.from_json(json_object: v)
end
        problem_id = Commons::ProblemId.from_json(json_object: struct.problemId)
        problem_version = struct.problemVersion
        problem_info = V2::Problem::ProblemInfoV2.from_json(json_object: struct.problemInfo)
        new(updates: updates, problem_id: problem_id, problem_version: problem_version, problem_info: problem_info, additional_properties: struct)
      end
      # Serialize an instance of TestSubmissionStatusV2 to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 updates: @updates,
 problemId: @problem_id,
 problemVersion: @problem_version,
 problemInfo: @problem_info
}.to_json()
      end
    end
  end
end