# frozen_string_literal: true

require "json"
require_relative "test_case_result_with_stdout"
require_relative "test_case_grade"
require_relative "traced_test_case"

module SeedTraceClient
  class Submission
    class SubmissionStatusForTestCase
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Submission::SubmissionStatusForTestCase]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of SubmissionStatusForTestCase
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::SubmissionStatusForTestCase]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "graded"
                   SeedTraceClient::Submission::TestCaseResultWithStdout.from_json(json_object: json_object)
                 when "gradedV2"
                   SeedTraceClient::Submission::TestCaseGrade.from_json(json_object: json_object.value)
                 when "traced"
                   SeedTraceClient::Submission::TracedTestCase.from_json(json_object: json_object)
                 else
                   SeedTraceClient::Submission::TestCaseResultWithStdout.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "graded"
          { **@member.to_json, type: @discriminant }.to_json
        when "gradedV2"
          { "type": @discriminant, "value": @member }.to_json
        when "traced"
          { **@member.to_json, type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "graded"
          SeedTraceClient::Submission::TestCaseResultWithStdout.validate_raw(obj: obj)
        when "gradedV2"
          SeedTraceClient::Submission::TestCaseGrade.validate_raw(obj: obj)
        when "traced"
          SeedTraceClient::Submission::TracedTestCase.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Submission::TestCaseResultWithStdout]
      # @return [SeedTraceClient::Submission::SubmissionStatusForTestCase]
      def self.graded(member:)
        new(member: member, discriminant: "graded")
      end

      # @param member [SeedTraceClient::Submission::TestCaseGrade]
      # @return [SeedTraceClient::Submission::SubmissionStatusForTestCase]
      def self.graded_v_2(member:)
        new(member: member, discriminant: "gradedV2")
      end

      # @param member [SeedTraceClient::Submission::TracedTestCase]
      # @return [SeedTraceClient::Submission::SubmissionStatusForTestCase]
      def self.traced(member:)
        new(member: member, discriminant: "traced")
      end
    end
  end
end
