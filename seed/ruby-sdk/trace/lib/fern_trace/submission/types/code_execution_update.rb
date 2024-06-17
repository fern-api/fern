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
      # @return [CodeExecutionUpdate]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of CodeExecutionUpdate
      #
      # @param json_object [String]
      # @return [CodeExecutionUpdate]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "buildingExecutor"
                   BuildingExecutorResponse.from_json(json_object: json_object)
                 when "running"
                   RunningResponse.from_json(json_object: json_object)
                 when "errored"
                   ErroredResponse.from_json(json_object: json_object)
                 when "stopped"
                   StoppedResponse.from_json(json_object: json_object)
                 when "graded"
                   GradedResponse.from_json(json_object: json_object)
                 when "gradedV2"
                   GradedResponseV2.from_json(json_object: json_object)
                 when "workspaceRan"
                   WorkspaceRanResponse.from_json(json_object: json_object)
                 when "recording"
                   RecordingResponseNotification.from_json(json_object: json_object)
                 when "recorded"
                   RecordedResponseNotification.from_json(json_object: json_object)
                 when "invalidRequest"
                   InvalidRequestResponse.from_json(json_object: json_object)
                 when "finished"
                   FinishedResponse.from_json(json_object: json_object)
                 else
                   BuildingExecutorResponse.from_json(json_object: json_object)
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
          BuildingExecutorResponse.validate_raw(obj: obj)
        when "running"
          RunningResponse.validate_raw(obj: obj)
        when "errored"
          ErroredResponse.validate_raw(obj: obj)
        when "stopped"
          StoppedResponse.validate_raw(obj: obj)
        when "graded"
          GradedResponse.validate_raw(obj: obj)
        when "gradedV2"
          GradedResponseV2.validate_raw(obj: obj)
        when "workspaceRan"
          WorkspaceRanResponse.validate_raw(obj: obj)
        when "recording"
          RecordingResponseNotification.validate_raw(obj: obj)
        when "recorded"
          RecordedResponseNotification.validate_raw(obj: obj)
        when "invalidRequest"
          InvalidRequestResponse.validate_raw(obj: obj)
        when "finished"
          FinishedResponse.validate_raw(obj: obj)
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

      # @param member [BuildingExecutorResponse]
      # @return [CodeExecutionUpdate]
      def self.building_executor(member:)
        new(member: member, discriminant: "buildingExecutor")
      end

      # @param member [RunningResponse]
      # @return [CodeExecutionUpdate]
      def self.running(member:)
        new(member: member, discriminant: "running")
      end

      # @param member [ErroredResponse]
      # @return [CodeExecutionUpdate]
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end

      # @param member [StoppedResponse]
      # @return [CodeExecutionUpdate]
      def self.stopped(member:)
        new(member: member, discriminant: "stopped")
      end

      # @param member [GradedResponse]
      # @return [CodeExecutionUpdate]
      def self.graded(member:)
        new(member: member, discriminant: "graded")
      end

      # @param member [GradedResponseV2]
      # @return [CodeExecutionUpdate]
      def self.graded_v_2(member:)
        new(member: member, discriminant: "gradedV2")
      end

      # @param member [WorkspaceRanResponse]
      # @return [CodeExecutionUpdate]
      def self.workspace_ran(member:)
        new(member: member, discriminant: "workspaceRan")
      end

      # @param member [RecordingResponseNotification]
      # @return [CodeExecutionUpdate]
      def self.recording(member:)
        new(member: member, discriminant: "recording")
      end

      # @param member [RecordedResponseNotification]
      # @return [CodeExecutionUpdate]
      def self.recorded(member:)
        new(member: member, discriminant: "recorded")
      end

      # @param member [InvalidRequestResponse]
      # @return [CodeExecutionUpdate]
      def self.invalid_request(member:)
        new(member: member, discriminant: "invalidRequest")
      end

      # @param member [FinishedResponse]
      # @return [CodeExecutionUpdate]
      def self.finished(member:)
        new(member: member, discriminant: "finished")
      end
    end
  end
end
