# frozen_string_literal: true
require "json"
require "submission/types/BuildingExecutorResponse"
require "submission/types/RunningResponse"
require "submission/types/ErroredResponse"
require "submission/types/StoppedResponse"
require "submission/types/GradedResponse"
require "submission/types/GradedResponseV2"
require "submission/types/WorkspaceRanResponse"
require "submission/types/RecordingResponseNotification"
require "submission/types/RecordedResponseNotification"
require "submission/types/InvalidRequestResponse"
require "submission/types/FinishedResponse"

module SeedClient
  module Submission
    class CodeExecutionUpdate
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::CodeExecutionUpdate] 
      def initialze(member:, discriminant:)
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
        case struct.type
        when "building_executor"
          member = Submission::BuildingExecutorResponse.from_json(json_object: json_object)
        when "running"
          member = Submission::RunningResponse.from_json(json_object: json_object)
        when "errored"
          member = Submission::ErroredResponse.from_json(json_object: json_object)
        when "stopped"
          member = Submission::StoppedResponse.from_json(json_object: json_object)
        when "graded"
          member = Submission::GradedResponse.from_json(json_object: json_object)
        when "graded_v_2"
          member = Submission::GradedResponseV2.from_json(json_object: json_object)
        when "workspace_ran"
          member = Submission::WorkspaceRanResponse.from_json(json_object: json_object)
        when "recording"
          member = Submission::RecordingResponseNotification.from_json(json_object: json_object)
        when "recorded"
          member = Submission::RecordedResponseNotification.from_json(json_object: json_object)
        when "invalid_request"
          member = Submission::InvalidRequestResponse.from_json(json_object: json_object)
        when "finished"
          member = Submission::FinishedResponse.from_json(json_object: json_object)
        else
          member = Submission::BuildingExecutorResponse.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "building_executor"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "running"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "errored"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "stopped"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "graded"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "graded_v_2"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "workspace_ran"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "recording"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "recorded"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "invalid_request"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "finished"
          { type: @discriminant, **@member.to_json() }.to_json()
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
        when "building_executor"
          BuildingExecutorResponse.validate_raw(obj: obj)
        when "running"
          RunningResponse.validate_raw(obj: obj)
        when "errored"
          ErroredResponse.validate_raw(obj: obj)
        when "stopped"
          StoppedResponse.validate_raw(obj: obj)
        when "graded"
          GradedResponse.validate_raw(obj: obj)
        when "graded_v_2"
          GradedResponseV2.validate_raw(obj: obj)
        when "workspace_ran"
          WorkspaceRanResponse.validate_raw(obj: obj)
        when "recording"
          RecordingResponseNotification.validate_raw(obj: obj)
        when "recorded"
          RecordedResponseNotification.validate_raw(obj: obj)
        when "invalid_request"
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
      # @return [] 
      def is_a(obj)
        @member.is_a?(obj)
      end
      # @param member [Submission::BuildingExecutorResponse] 
      # @return [Submission::CodeExecutionUpdate] 
      def self.building_executor(member:)
        new(member: member, discriminant: "building_executor")
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
        new(member: member, discriminant: "graded_v_2")
      end
      # @param member [Submission::WorkspaceRanResponse] 
      # @return [Submission::CodeExecutionUpdate] 
      def self.workspace_ran(member:)
        new(member: member, discriminant: "workspace_ran")
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
        new(member: member, discriminant: "invalid_request")
      end
      # @param member [Submission::FinishedResponse] 
      # @return [Submission::CodeExecutionUpdate] 
      def self.finished(member:)
        new(member: member, discriminant: "finished")
      end
    end
  end
end