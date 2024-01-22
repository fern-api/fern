# frozen_string_literal: true
require "json"
require "submission/types/RunningSubmissionState"
require "submission/types/ErrorInfo"
require "submission/types/GradedTestCaseUpdate"
require "submission/types/RecordedTestCaseUpdate"

module SeedClient
  module Submission
    class TestSubmissionUpdateInfo
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::TestSubmissionUpdateInfo] 
      def initialze(member:, discriminant:)
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
        case struct.type
        when "running"
          member = Submission::RunningSubmissionState.from_json(json_object: json_object.value)
        when "stopped"
          member = nil
        when "errored"
          member = Submission::ErrorInfo.from_json(json_object: json_object.value)
        when "graded_test_case"
          member = Submission::GradedTestCaseUpdate.from_json(json_object: json_object)
        when "recorded_test_case"
          member = Submission::RecordedTestCaseUpdate.from_json(json_object: json_object)
        when "finished"
          member = nil
        else
          member = Submission::RunningSubmissionState.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "running"
          { type: @discriminant, value: @member }.to_json()
        when "stopped"
          { type: @discriminant }.to_json()
        when "errored"
          { type: @discriminant, value: @member }.to_json()
        when "graded_test_case"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "recorded_test_case"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "finished"
          { type: @discriminant }.to_json()
        else
          { type: @discriminant, value: @member }.to_json()
        end
        @member.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        case obj.type
        when "running"
          RunningSubmissionState.validate_raw(obj: obj)
        when "stopped"
          # noop
        when "errored"
          ErrorInfo.validate_raw(obj: obj)
        when "graded_test_case"
          GradedTestCaseUpdate.validate_raw(obj: obj)
        when "recorded_test_case"
          RecordedTestCaseUpdate.validate_raw(obj: obj)
        when "finished"
          # noop
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end
      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object] 
      # @return [] 
      def is_a(obj)
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
        new(member: member, discriminant: "graded_test_case")
      end
      # @param member [Submission::RecordedTestCaseUpdate] 
      # @return [Submission::TestSubmissionUpdateInfo] 
      def self.recorded_test_case(member:)
        new(member: member, discriminant: "recorded_test_case")
      end
      # @return [Submission::TestSubmissionUpdateInfo] 
      def self.finished
        new(member: nil, discriminant: "finished")
      end
    end
  end
end