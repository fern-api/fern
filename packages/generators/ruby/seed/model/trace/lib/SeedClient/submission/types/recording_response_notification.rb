# frozen_string_literal: true
require "submission/types/SubmissionId"
require "submission/types/LightweightStackframeInformation"
require "submission/types/TracedFile"
require "json"

module SeedClient
  module Submission
    class RecordingResponseNotification
      attr_reader :submission_id, :test_case_id, :line_number, :lightweight_stack_info, :traced_file, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param test_case_id [String] 
      # @param line_number [Integer] 
      # @param lightweight_stack_info [Submission::LightweightStackframeInformation] 
      # @param traced_file [Submission::TracedFile] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::RecordingResponseNotification] 
      def initialze(submission_id:, test_case_id: nil, line_number:, lightweight_stack_info:, traced_file: nil, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [String] 
        @test_case_id = test_case_id
        # @type [Integer] 
        @line_number = line_number
        # @type [Submission::LightweightStackframeInformation] 
        @lightweight_stack_info = lightweight_stack_info
        # @type [Submission::TracedFile] 
        @traced_file = traced_file
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of RecordingResponseNotification
      #
      # @param json_object [JSON] 
      # @return [Submission::RecordingResponseNotification] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id Submission::SubmissionId.from_json(json_object: struct.submissionId)
        test_case_id struct.testCaseId
        line_number struct.lineNumber
        lightweight_stack_info Submission::LightweightStackframeInformation.from_json(json_object: struct.lightweightStackInfo)
        traced_file Submission::TracedFile.from_json(json_object: struct.tracedFile)
        new(submission_id: submission_id, test_case_id: test_case_id, line_number: line_number, lightweight_stack_info: lightweight_stack_info, traced_file: traced_file, additional_properties: struct)
      end
      # Serialize an instance of RecordingResponseNotification to a JSON object
      #
      # @return [JSON] 
      def to_json
        { submissionId: @submission_id, testCaseId: @test_case_id, lineNumber: @line_number, lightweightStackInfo: @lightweight_stack_info, tracedFile: @traced_file }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        SubmissionId.validate_raw(obj: obj.submission_id)
        obj.test_case_id&.is_a?(String) != false || raise("Passed value for field obj.test_case_id is not the expected type, validation failed.")
        obj.line_number.is_a?(Integer) != false || raise("Passed value for field obj.line_number is not the expected type, validation failed.")
        LightweightStackframeInformation.validate_raw(obj: obj.lightweight_stack_info)
        obj.traced_file.nil?() || TracedFile.validate_raw(obj: obj.traced_file)
      end
    end
  end
end