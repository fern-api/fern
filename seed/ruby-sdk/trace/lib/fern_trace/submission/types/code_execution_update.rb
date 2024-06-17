# frozen_string_literal: true

require "json"
require_relative "building_executor_response"
require_relative "running_response"
require_relative "errored_response"
require_relative "stopped_response"
require_relative "graded_response"
require_relative "graded_response_v_2"
require_relative "workspace_ran_response"
require_relative "recording_response_notification"
require_relative "recorded_response_notification"
require_relative "invalid_request_response"
require_relative "finished_response"

module SeedTraceClient
  class Submission
    class CodeExecutionUpdate
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of CodeExecutionUpdate
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "buildingExecutor"
                   SeedTraceClient::Submission::BuildingExecutorResponse.from_json(json_object: json_object)
                 when "running"
                   SeedTraceClient::Submission::RunningResponse.from_json(json_object: json_object)
                 when "errored"
                   SeedTraceClient::Submission::ErroredResponse.from_json(json_object: json_object)
                 when "stopped"
                   SeedTraceClient::Submission::StoppedResponse.from_json(json_object: json_object)
                 when "graded"
                   SeedTraceClient::Submission::GradedResponse.from_json(json_object: json_object)
                 when "gradedV2"
                   SeedTraceClient::Submission::GradedResponseV2.from_json(json_object: json_object)
                 when "workspaceRan"
                   SeedTraceClient::Submission::WorkspaceRanResponse.from_json(json_object: json_object)
                 when "recording"
                   SeedTraceClient::Submission::RecordingResponseNotification.from_json(json_object: json_object)
                 when "recorded"
                   SeedTraceClient::Submission::RecordedResponseNotification.from_json(json_object: json_object)
                 when "invalidRequest"
                   SeedTraceClient::Submission::InvalidRequestResponse.from_json(json_object: json_object)
                 when "finished"
                   SeedTraceClient::Submission::FinishedResponse.from_json(json_object: json_object)
                 else
                   SeedTraceClient::Submission::BuildingExecutorResponse.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "buildingExecutor"
          { **@member.to_json, type: @discriminant }.to_json
        when "running"
          { **@member.to_json, type: @discriminant }.to_json
        when "errored"
          { **@member.to_json, type: @discriminant }.to_json
        when "stopped"
          { **@member.to_json, type: @discriminant }.to_json
        when "graded"
          { **@member.to_json, type: @discriminant }.to_json
        when "gradedV2"
          { **@member.to_json, type: @discriminant }.to_json
        when "workspaceRan"
          { **@member.to_json, type: @discriminant }.to_json
        when "recording"
          { **@member.to_json, type: @discriminant }.to_json
        when "recorded"
          { **@member.to_json, type: @discriminant }.to_json
        when "invalidRequest"
          { **@member.to_json, type: @discriminant }.to_json
        when "finished"
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
        when "buildingExecutor"
          SeedTraceClient::Submission::BuildingExecutorResponse.validate_raw(obj: obj)
        when "running"
          SeedTraceClient::Submission::RunningResponse.validate_raw(obj: obj)
        when "errored"
          SeedTraceClient::Submission::ErroredResponse.validate_raw(obj: obj)
        when "stopped"
          SeedTraceClient::Submission::StoppedResponse.validate_raw(obj: obj)
        when "graded"
          SeedTraceClient::Submission::GradedResponse.validate_raw(obj: obj)
        when "gradedV2"
          SeedTraceClient::Submission::GradedResponseV2.validate_raw(obj: obj)
        when "workspaceRan"
          SeedTraceClient::Submission::WorkspaceRanResponse.validate_raw(obj: obj)
        when "recording"
          SeedTraceClient::Submission::RecordingResponseNotification.validate_raw(obj: obj)
        when "recorded"
          SeedTraceClient::Submission::RecordedResponseNotification.validate_raw(obj: obj)
        when "invalidRequest"
          SeedTraceClient::Submission::InvalidRequestResponse.validate_raw(obj: obj)
        when "finished"
          SeedTraceClient::Submission::FinishedResponse.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Submission::BuildingExecutorResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.building_executor(member:)
        new(member: member, discriminant: "buildingExecutor")
      end

      # @param member [SeedTraceClient::Submission::RunningResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.running(member:)
        new(member: member, discriminant: "running")
      end

      # @param member [SeedTraceClient::Submission::ErroredResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end

      # @param member [SeedTraceClient::Submission::StoppedResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.stopped(member:)
        new(member: member, discriminant: "stopped")
      end

      # @param member [SeedTraceClient::Submission::GradedResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.graded(member:)
        new(member: member, discriminant: "graded")
      end

      # @param member [SeedTraceClient::Submission::GradedResponseV2]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.graded_v_2(member:)
        new(member: member, discriminant: "gradedV2")
      end

      # @param member [SeedTraceClient::Submission::WorkspaceRanResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.workspace_ran(member:)
        new(member: member, discriminant: "workspaceRan")
      end

      # @param member [SeedTraceClient::Submission::RecordingResponseNotification]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.recording(member:)
        new(member: member, discriminant: "recording")
      end

      # @param member [SeedTraceClient::Submission::RecordedResponseNotification]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.recorded(member:)
        new(member: member, discriminant: "recorded")
      end

      # @param member [SeedTraceClient::Submission::InvalidRequestResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.invalid_request(member:)
        new(member: member, discriminant: "invalidRequest")
      end

      # @param member [SeedTraceClient::Submission::FinishedResponse]
      # @return [SeedTraceClient::Submission::CodeExecutionUpdate]
      def self.finished(member:)
        new(member: member, discriminant: "finished")
      end
    end
  end
end
