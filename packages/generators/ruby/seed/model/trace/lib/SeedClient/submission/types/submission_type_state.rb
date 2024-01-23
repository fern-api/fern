# frozen_string_literal: true

require "json"
require_relative "test_submission_state"
require_relative "workspace_submission_state"

module SeedClient
  module Submission
    class SubmissionTypeState
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::SubmissionTypeState]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of SubmissionTypeState
      #
      # @param json_object [JSON]
      # @return [Submission::SubmissionTypeState]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "test"
                   Submission::TestSubmissionState.from_json(json_object: json_object)
                 when "workspace"
                   Submission::WorkspaceSubmissionState.from_json(json_object: json_object)
                 else
                   Submission::TestSubmissionState.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "test"
          { type: @discriminant, **@member.to_json }.to_json
        when "workspace"
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
        when "test"
          Submission::TestSubmissionState.validate_raw(obj: obj)
        when "workspace"
          Submission::WorkspaceSubmissionState.validate_raw(obj: obj)
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

      # @param member [Submission::TestSubmissionState]
      # @return [Submission::SubmissionTypeState]
      def self.test(member:)
        new(member: member, discriminant: "test")
      end

      # @param member [Submission::WorkspaceSubmissionState]
      # @return [Submission::SubmissionTypeState]
      def self.workspace(member:)
        new(member: member, discriminant: "workspace")
      end
    end
  end
end
