# frozen_string_literal: true
require "json"
require "submission/types/RunningSubmissionState"
require "submission/types/WorkspaceRunDetails"
require "submission/types/WorkspaceTracedUpdate"
require "submission/types/ErrorInfo"

module SeedClient
  module Submission
    class WorkspaceSubmissionUpdateInfo
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of WorkspaceSubmissionUpdateInfo
      #
      # @param json_object [JSON] 
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "running"
          member = Submission::RunningSubmissionState.from_json(json_object: json_object.value)
        when "ran"
          member = Submission::WorkspaceRunDetails.from_json(json_object: json_object)
        when "stopped"
          member = nil
        when "traced"
          member = nil
        when "traced_v_2"
          member = Submission::WorkspaceTracedUpdate.from_json(json_object: json_object)
        when "errored"
          member = Submission::ErrorInfo.from_json(json_object: json_object.value)
        when "finished"
          member = nil
        else
          member = Submission::RunningSubmissionState.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "running"
          { type: @discriminant, value: @member }.to_json()
        when "ran"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "stopped"
          { type: @discriminant }.to_json()
        when "traced"
          { type: @discriminant }.to_json()
        when "traced_v_2"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "errored"
          { type: @discriminant, value: @member }.to_json()
        when "finished"
          { type: @discriminant }.to_json()
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
        when "running"
          RunningSubmissionState.validate_raw(obj: obj)
        when "ran"
          WorkspaceRunDetails.validate_raw(obj: obj)
        when "stopped"
          # noop
        when "traced"
          # noop
        when "traced_v_2"
          WorkspaceTracedUpdate.validate_raw(obj: obj)
        when "errored"
          ErrorInfo.validate_raw(obj: obj)
        when "finished"
          # noop
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
      # @param member [Submission::RunningSubmissionState] 
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.running(member:)
        new(member: member, discriminant: "running")
      end
      # @param member [Submission::WorkspaceRunDetails] 
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.ran(member:)
        new(member: member, discriminant: "ran")
      end
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.stopped
        new(member: nil, discriminant: "stopped")
      end
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.traced
        new(member: nil, discriminant: "traced")
      end
      # @param member [Submission::WorkspaceTracedUpdate] 
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.traced_v_2(member:)
        new(member: member, discriminant: "traced_v_2")
      end
      # @param member [Submission::ErrorInfo] 
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end
      # @return [Submission::WorkspaceSubmissionUpdateInfo] 
      def self.finished
        new(member: nil, discriminant: "finished")
      end
    end
  end
end