# frozen_string_literal: true

require "json"
require_relative "building_executor_response"
require_relative "errored_response"
require_relative "finished_response"
require_relative "graded_response"
require_relative "graded_response_v_2"
require_relative "invalid_request_response"
require_relative "recorded_response_notification"
require_relative "recording_response_notification"
require_relative "running_response"
require_relative "stopped_response"
require_relative "workspace_ran_response"

module SeedTraceClient
  module Submission
    class CodeExecutionUpdate
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::CodeExecutionUpdate]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of CodeExecutionUpdate
      #
      # @param json_object [JSON]
      # @return [Submission::CodeExecutionUpdate]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "buildingExecutor"
                   Submission::BuildingExecutorResponse.from_json(json_object: json_object)
                 when "running"
                   Submission::RunningResponse.from_json(json_object: json_object)
                 when "errored"
                   Submission::ErroredResponse.from_json(json_object: json_object)
                 when "stopped"
                   Submission::StoppedResponse.from_json(json_object: json_object)
                 when "graded"
                   Submission::GradedResponse.from_json(json_object: json_object)
                 when "gradedV2"
                   Submission::GradedResponseV2.from_json(json_object: json_object)
                 when "workspaceRan"
                   Submission::WorkspaceRanResponse.from_json(json_object: json_object)
                 when "recording"
                   Submission::RecordingResponseNotification.from_json(json_object: json_object)
                 when "recorded"
                   Submission::RecordedResponseNotification.from_json(json_object: json_object)
                 when "invalidRequest"
                   Submission::InvalidRequestResponse.from_json(json_object: json_object)
                 when "finished"
                   Submission::FinishedResponse.from_json(json_object: json_object)
                 else
                   Submission::BuildingExecutorResponse.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
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

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "buildingExecutor"
          Submission::BuildingExecutorResponse.validate_raw(obj: obj)
        when "running"
          Submission::RunningResponse.validate_raw(obj: obj)
        when "errored"
          Submission::ErroredResponse.validate_raw(obj: obj)
        when "stopped"
          Submission::StoppedResponse.validate_raw(obj: obj)
        when "graded"
          Submission::GradedResponse.validate_raw(obj: obj)
        when "gradedV2"
          Submission::GradedResponseV2.validate_raw(obj: obj)
        when "workspaceRan"
          Submission::WorkspaceRanResponse.validate_raw(obj: obj)
        when "recording"
          Submission::RecordingResponseNotification.validate_raw(obj: obj)
        when "recorded"
          Submission::RecordedResponseNotification.validate_raw(obj: obj)
        when "invalidRequest"
          Submission::InvalidRequestResponse.validate_raw(obj: obj)
        when "finished"
          Submission::FinishedResponse.validate_raw(obj: obj)
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

      # @param member [Submission::BuildingExecutorResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.building_executor(member:)
        new(member: member, discriminant: "buildingExecutor")
      end

      # @param member [Submission::RunningResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.running(member:)
        new(member: member, discriminant: "running")
      end

      # @param member [Submission::ErroredResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end

      # @param member [Submission::StoppedResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.stopped(member:)
        new(member: member, discriminant: "stopped")
      end

      # @param member [Submission::GradedResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.graded(member:)
        new(member: member, discriminant: "graded")
      end

      # @param member [Submission::GradedResponseV2]
      # @return [Submission::CodeExecutionUpdate]
      def self.graded_v_2(member:)
        new(member: member, discriminant: "gradedV2")
      end

      # @param member [Submission::WorkspaceRanResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.workspace_ran(member:)
        new(member: member, discriminant: "workspaceRan")
      end

      # @param member [Submission::RecordingResponseNotification]
      # @return [Submission::CodeExecutionUpdate]
      def self.recording(member:)
        new(member: member, discriminant: "recording")
      end

      # @param member [Submission::RecordedResponseNotification]
      # @return [Submission::CodeExecutionUpdate]
      def self.recorded(member:)
        new(member: member, discriminant: "recorded")
      end

      # @param member [Submission::InvalidRequestResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.invalid_request(member:)
        new(member: member, discriminant: "invalidRequest")
      end

      # @param member [Submission::FinishedResponse]
      # @return [Submission::CodeExecutionUpdate]
      def self.finished(member:)
        new(member: member, discriminant: "finished")
      end
    end
  end
end
