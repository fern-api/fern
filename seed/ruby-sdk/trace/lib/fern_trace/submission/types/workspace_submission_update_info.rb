# frozen_string_literal: true

require "json"
require_relative "workspace_run_details"
require_relative "workspace_traced_update"
require_relative "error_info"
require_relative "running_submission_state"

module SeedTraceClient
  class Submission
    class WorkspaceSubmissionUpdateInfo
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmissionUpdateInfo
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "running"
                   json_object.value
                 when "ran"
                   SeedTraceClient::Submission::WorkspaceRunDetails.from_json(json_object: json_object)
                 when "stopped"
                   nil
                 when "traced"
                   nil
                 when "tracedV2"
                   SeedTraceClient::Submission::WorkspaceTracedUpdate.from_json(json_object: json_object)
                 when "errored"
                   SeedTraceClient::Submission::ErrorInfo.from_json(json_object: json_object.value)
                 when "finished"
                   nil
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "running"
          { "type": @discriminant, "value": @member }.to_json
        when "ran"
          { **@member.to_json, type: @discriminant }.to_json
        when "stopped"
          { type: @discriminant }.to_json
        when "traced"
          { type: @discriminant }.to_json
        when "tracedV2"
          { **@member.to_json, type: @discriminant }.to_json
        when "errored"
          { "type": @discriminant, "value": @member }.to_json
        when "finished"
          { type: @discriminant }.to_json
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
        when "running"
          obj.is_a?(SeedTraceClient::Submission::RunningSubmissionState) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "ran"
          SeedTraceClient::Submission::WorkspaceRunDetails.validate_raw(obj: obj)
        when "stopped"
          # noop
        when "traced"
          # noop
        when "tracedV2"
          SeedTraceClient::Submission::WorkspaceTracedUpdate.validate_raw(obj: obj)
        when "errored"
          SeedTraceClient::Submission::ErrorInfo.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Submission::RunningSubmissionState]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.running(member:)
        new(member: member, discriminant: "running")
      end

      # @param member [SeedTraceClient::Submission::WorkspaceRunDetails]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.ran(member:)
        new(member: member, discriminant: "ran")
      end

      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.stopped
        new(member: nil, discriminant: "stopped")
      end

      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.traced
        new(member: nil, discriminant: "traced")
      end

      # @param member [SeedTraceClient::Submission::WorkspaceTracedUpdate]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.traced_v_2(member:)
        new(member: member, discriminant: "tracedV2")
      end

      # @param member [SeedTraceClient::Submission::ErrorInfo]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end

      # @return [SeedTraceClient::Submission::WorkspaceSubmissionUpdateInfo]
      def self.finished
        new(member: nil, discriminant: "finished")
      end
    end
  end
end
