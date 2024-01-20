# frozen_string_literal: true

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
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of RecordingResponseNotification
      #
      # @param json_object [JSON] 
      # @return [Submission::RecordingResponseNotification] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        test_case_id = struct.testCaseId
        line_number = struct.lineNumber
        lightweight_stack_info = Submission::LightweightStackframeInformation.from_json(json_object: struct.lightweightStackInfo)
        traced_file = Submission::TracedFile.from_json(json_object: struct.tracedFile)
        new(submission_id: submission_id, test_case_id: test_case_id, line_number: line_number, lightweight_stack_info: lightweight_stack_info, traced_file: traced_file, additional_properties: struct)
      end
      # Serialize an instance of RecordingResponseNotification to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 submissionId: @submission_id,
 testCaseId: @test_case_id,
 lineNumber: @line_number,
 lightweightStackInfo: @lightweight_stack_info,
 tracedFile: @traced_file
}.to_json()
      end
    end
  end
end