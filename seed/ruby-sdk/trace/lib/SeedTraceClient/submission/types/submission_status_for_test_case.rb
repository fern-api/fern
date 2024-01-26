# frozen_string_literal: true

require "json"
require_relative "test_case_result_with_stdout"
require_relative "test_case_grade"
require_relative "traced_test_case"

module SeedTraceClient
  module Submission
    class SubmissionStatusForTestCase
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::SubmissionStatusForTestCase]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of SubmissionStatusForTestCase
      #
      # @param json_object [JSON]
      # @return [Submission::SubmissionStatusForTestCase]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "graded"
                   Submission::TestCaseResultWithStdout.from_json(json_object: json_object)
                 when "gradedV2"
                   Submission::TestCaseGrade.from_json(json_object: json_object.value)
                 when "traced"
                   Submission::TracedTestCase.from_json(json_object: json_object)
                 else
                   Submission::TestCaseResultWithStdout.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "graded"
          { type: @discriminant, **@member.to_json }.to_json
        when "gradedV2"
          { "type": @discriminant, "value": @member }.to_json
        when "traced"
          { type: @discriminant, **@member.to_json }.to_json
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
        when "graded"
          Submission::TestCaseResultWithStdout.validate_raw(obj: obj)
        when "gradedV2"
          Submission::TestCaseGrade.validate_raw(obj: obj)
        when "traced"
          Submission::TracedTestCase.validate_raw(obj: obj)
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

      # @param member [Submission::TestCaseResultWithStdout]
      # @return [Submission::SubmissionStatusForTestCase]
      def self.graded(member:)
        new(member: member, discriminant: "graded")
      end

      # @param member [Submission::TestCaseGrade]
      # @return [Submission::SubmissionStatusForTestCase]
      def self.graded_v_2(member:)
        new(member: member, discriminant: "gradedV2")
      end

      # @param member [Submission::TracedTestCase]
      # @return [Submission::SubmissionStatusForTestCase]
      def self.traced(member:)
        new(member: member, discriminant: "traced")
      end
    end
  end
end
