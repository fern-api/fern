# frozen_string_literal: true

require "json"
require_relative "test_submission_status_v_2"
require_relative "workspace_submission_status_v_2"

module SeedTraceClient
  class Submission
    class SubmissionStatusV2
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Submission::SubmissionStatusV2]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of SubmissionStatusV2
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::SubmissionStatusV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "test"
                   SeedTraceClient::Submission::TestSubmissionStatusV2.from_json(json_object: json_object)
                 when "workspace"
                   SeedTraceClient::Submission::WorkspaceSubmissionStatusV2.from_json(json_object: json_object)
                 else
                   SeedTraceClient::Submission::TestSubmissionStatusV2.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "test"
          { **@member.to_json, type: @discriminant }.to_json
        when "workspace"
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
        when "test"
          SeedTraceClient::Submission::TestSubmissionStatusV2.validate_raw(obj: obj)
        when "workspace"
          SeedTraceClient::Submission::WorkspaceSubmissionStatusV2.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Submission::TestSubmissionStatusV2]
      # @return [SeedTraceClient::Submission::SubmissionStatusV2]
      def self.test(member:)
        new(member: member, discriminant: "test")
      end

      # @param member [SeedTraceClient::Submission::WorkspaceSubmissionStatusV2]
      # @return [SeedTraceClient::Submission::SubmissionStatusV2]
      def self.workspace(member:)
        new(member: member, discriminant: "workspace")
      end
    end
  end
end
