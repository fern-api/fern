# frozen_string_literal: true

require_relative "lightweight_stackframe_information"
require_relative "traced_file"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class RecordingResponseNotification
      # @return [String]
      attr_reader :submission_id
      # @return [String]
      attr_reader :test_case_id
      # @return [Integer]
      attr_reader :line_number
      # @return [SeedTraceClient::Submission::LightweightStackframeInformation]
      attr_reader :lightweight_stack_info
      # @return [SeedTraceClient::Submission::TracedFile]
      attr_reader :traced_file
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param test_case_id [String]
      # @param line_number [Integer]
      # @param lightweight_stack_info [SeedTraceClient::Submission::LightweightStackframeInformation]
      # @param traced_file [SeedTraceClient::Submission::TracedFile]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::RecordingResponseNotification]
      def initialize(submission_id:, line_number:, lightweight_stack_info:, test_case_id: OMIT, traced_file: OMIT,
                     additional_properties: nil)
        @submission_id = submission_id
        @test_case_id = test_case_id if test_case_id != OMIT
        @line_number = line_number
        @lightweight_stack_info = lightweight_stack_info
        @traced_file = traced_file if traced_file != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "submissionId": submission_id,
          "testCaseId": test_case_id,
          "lineNumber": line_number,
          "lightweightStackInfo": lightweight_stack_info,
          "tracedFile": traced_file
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of RecordingResponseNotification
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::RecordingResponseNotification]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = parsed_json["submissionId"]
        test_case_id = parsed_json["testCaseId"]
        line_number = parsed_json["lineNumber"]
        if parsed_json["lightweightStackInfo"].nil?
          lightweight_stack_info = nil
        else
          lightweight_stack_info = parsed_json["lightweightStackInfo"].to_json
          lightweight_stack_info = SeedTraceClient::Submission::LightweightStackframeInformation.from_json(json_object: lightweight_stack_info)
        end
        if parsed_json["tracedFile"].nil?
          traced_file = nil
        else
          traced_file = parsed_json["tracedFile"].to_json
          traced_file = SeedTraceClient::Submission::TracedFile.from_json(json_object: traced_file)
        end
        new(
          submission_id: submission_id,
          test_case_id: test_case_id,
          line_number: line_number,
          lightweight_stack_info: lightweight_stack_info,
          traced_file: traced_file,
          additional_properties: struct
        )
      end

      # Serialize an instance of RecordingResponseNotification to a JSON object
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
        obj.test_case_id&.is_a?(String) != false || raise("Passed value for field obj.test_case_id is not the expected type, validation failed.")
        obj.line_number.is_a?(Integer) != false || raise("Passed value for field obj.line_number is not the expected type, validation failed.")
        SeedTraceClient::Submission::LightweightStackframeInformation.validate_raw(obj: obj.lightweight_stack_info)
        obj.traced_file.nil? || SeedTraceClient::Submission::TracedFile.validate_raw(obj: obj.traced_file)
      end
    end
  end
end
