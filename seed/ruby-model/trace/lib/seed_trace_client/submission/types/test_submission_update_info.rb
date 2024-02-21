# frozen_string_literal: true

require "json"
require_relative "error_info"
require_relative "graded_test_case_update"
require_relative "recorded_test_case_update"
require_relative "running_submission_state"

module SeedTraceClient
  class Submission
    class TestSubmissionUpdateInfo
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::TestSubmissionUpdateInfo]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of TestSubmissionUpdateInfo
      #
      # @param json_object [JSON]
      # @return [Submission::TestSubmissionUpdateInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "running"
                   json_object.value
                 when "stopped"
                   nil
                 when "errored"
                   Submission::ErrorInfo.from_json(json_object: json_object.value)
                 when "gradedTestCase"
                   Submission::GradedTestCaseUpdate.from_json(json_object: json_object)
                 when "recordedTestCase"
                   Submission::RecordedTestCaseUpdate.from_json(json_object: json_object)
                 when "finished"
                   nil
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "running"
          { "type": @discriminant, "value": @member }.to_json
        when "stopped"
          { type: @discriminant }.to_json
        when "errored"
          { "type": @discriminant, "value": @member }.to_json
        when "gradedTestCase"
          { **@member.to_json, type: @discriminant }.to_json
        when "recordedTestCase"
          { **@member.to_json, type: @discriminant }.to_json
        when "finished"
          { type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "running"
          obj.is_a?(Submission::RunningSubmissionState) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "stopped"
          # noop
        when "errored"
          Submission::ErrorInfo.validate_raw(obj: obj)
        when "gradedTestCase"
          Submission::GradedTestCaseUpdate.validate_raw(obj: obj)
        when "recordedTestCase"
          Submission::RecordedTestCaseUpdate.validate_raw(obj: obj)
        when "finished"
          # noop
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [Submission::RunningSubmissionState]
      # @return [Submission::TestSubmissionUpdateInfo]
      def self.running(member:)
        new(member: member, discriminant: "running")
      end

      # @return [Submission::TestSubmissionUpdateInfo]
      def self.stopped
        new(member: nil, discriminant: "stopped")
      end

      # @param member [Submission::ErrorInfo]
      # @return [Submission::TestSubmissionUpdateInfo]
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end

      # @param member [Submission::GradedTestCaseUpdate]
      # @return [Submission::TestSubmissionUpdateInfo]
      def self.graded_test_case(member:)
        new(member: member, discriminant: "gradedTestCase")
      end

      # @param member [Submission::RecordedTestCaseUpdate]
      # @return [Submission::TestSubmissionUpdateInfo]
      def self.recorded_test_case(member:)
        new(member: member, discriminant: "recordedTestCase")
      end

      # @return [Submission::TestSubmissionUpdateInfo]
      def self.finished
        new(member: nil, discriminant: "finished")
      end
    end
  end
end
