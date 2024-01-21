# frozen_string_literal: true
require "v_2/problem/types/TestCaseId"
require "json"

module SeedClient
  module Submission
    class RecordedTestCaseUpdate
      attr_reader :test_case_id, :trace_responses_size, :additional_properties
      # @param test_case_id [V2::Problem::TestCaseId] 
      # @param trace_responses_size [Integer] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::RecordedTestCaseUpdate] 
      def initialze(test_case_id:, trace_responses_size:, additional_properties: nil)
        # @type [V2::Problem::TestCaseId] 
        @test_case_id = test_case_id
        # @type [Integer] 
        @trace_responses_size = trace_responses_size
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of RecordedTestCaseUpdate
      #
      # @param json_object [JSON] 
      # @return [Submission::RecordedTestCaseUpdate] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        test_case_id = V2::Problem::TestCaseId.from_json(json_object: struct.testCaseId)
        trace_responses_size = struct.traceResponsesSize
        new(test_case_id: test_case_id, trace_responses_size: trace_responses_size, additional_properties: struct)
      end
      # Serialize an instance of RecordedTestCaseUpdate to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 testCaseId: @test_case_id,
 traceResponsesSize: @trace_responses_size
}.to_json()
      end
    end
  end
end