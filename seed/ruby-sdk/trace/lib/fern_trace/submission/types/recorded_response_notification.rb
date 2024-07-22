# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class RecordedResponseNotification
      # @return [String]
      attr_reader :submission_id
      # @return [Integer]
      attr_reader :trace_responses_size
      # @return [String]
      attr_reader :test_case_id
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param trace_responses_size [Integer]
      # @param test_case_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::RecordedResponseNotification]
      def initialize(submission_id:, trace_responses_size:, test_case_id: OMIT, additional_properties: nil)
        @submission_id = submission_id
        @trace_responses_size = trace_responses_size
        @test_case_id = test_case_id if test_case_id != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "submissionId": submission_id,
          "traceResponsesSize": trace_responses_size,
          "testCaseId": test_case_id
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of RecordedResponseNotification
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::RecordedResponseNotification]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = parsed_json["submissionId"]
        trace_responses_size = parsed_json["traceResponsesSize"]
        test_case_id = parsed_json["testCaseId"]
        new(
          submission_id: submission_id,
          trace_responses_size: trace_responses_size,
          test_case_id: test_case_id,
          additional_properties: struct
        )
      end

      # Serialize an instance of RecordedResponseNotification to a JSON object
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
        obj.submission_id.is_a?(String) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.trace_responses_size.is_a?(Integer) != false || raise("Passed value for field obj.trace_responses_size is not the expected type, validation failed.")
        obj.test_case_id&.is_a?(String) != false || raise("Passed value for field obj.test_case_id is not the expected type, validation failed.")
      end
    end
  end
end
