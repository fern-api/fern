# frozen_string_literal: true

require_relative "json"
require_relative "submission/types/ErrorInfo"

module SeedClient
  module Submission
    class TestSubmissionStatus
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::TestSubmissionStatus]
      def initialze(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of TestSubmissionStatus
      #
      # @param json_object [JSON]
      # @return [Submission::TestSubmissionStatus]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "stopped"
                   nil
                 when "errored"
                   Submission::ErrorInfo.from_json(json_object: json_object.value)
                 when "running"
                   RUNNING_SUBMISSION_STATE.key(json_object.value)
                 when "testCaseIdToState"
                   json_object.value
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
        when "stopped"
          { type: @discriminant }.to_json
        when "errored"
          { type: @discriminant, value: @member }.to_json
        when "running"
          { type: @discriminant, value: @member }.to_json
        when "testCaseIdToState"
          { type: @discriminant, value: @member }.to_json
        else
          { type: @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "stopped"
          # noop
        when "errored"
          Submission::ErrorInfo.validate_raw(obj: obj)
        when "running"
          obj.is_a?(RUNNING_SUBMISSION_STATE) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "testCaseIdToState"
          obj.is_a?(Hash) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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

      # @return [Submission::TestSubmissionStatus]
      def self.stopped
        new(member: nil, discriminant: "stopped")
      end

      # @param member [Submission::ErrorInfo]
      # @return [Submission::TestSubmissionStatus]
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end

      # @param member [Hash{String => String}]
      # @return [Submission::TestSubmissionStatus]
      def self.running(member:)
        new(member: member, discriminant: "running")
      end

      # @param member [Hash{String => String}]
      # @return [Submission::TestSubmissionStatus]
      def self.test_case_id_to_state(member:)
        new(member: member, discriminant: "testCaseIdToState")
      end
    end
  end
end
