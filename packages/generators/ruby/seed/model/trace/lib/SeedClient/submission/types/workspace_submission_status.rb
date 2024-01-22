# frozen_string_literal: true
require "json"
require "submission/types/ErrorInfo"
require "submission/types/RunningSubmissionState"
require "submission/types/WorkspaceRunDetails"
require "submission/types/WorkspaceRunDetails"

module SeedClient
  module Submission
    class WorkspaceSubmissionStatus
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::WorkspaceSubmissionStatus] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of WorkspaceSubmissionStatus
      #
      # @param json_object [JSON] 
      # @return [Submission::WorkspaceSubmissionStatus] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "stopped"
          member = nil
        when "errored"
          member = Submission::ErrorInfo.from_json(json_object: json_object.value)
        when "running"
          member = Submission::RunningSubmissionState.from_json(json_object: json_object.value)
        when "ran"
          member = Submission::WorkspaceRunDetails.from_json(json_object: json_object)
        when "traced"
          member = Submission::WorkspaceRunDetails.from_json(json_object: json_object)
        else
          member = json_object
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "stopped"
          { type: @discriminant }.to_json()
        when "errored"
          { type: @discriminant, value: @member }.to_json()
        when "running"
          { type: @discriminant, value: @member }.to_json()
        when "ran"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "traced"
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
        when "stopped"
          # noop
        when "errored"
          ErrorInfo.validate_raw(obj: obj)
        when "running"
          RunningSubmissionState.validate_raw(obj: obj)
        when "ran"
          WorkspaceRunDetails.validate_raw(obj: obj)
        when "traced"
          WorkspaceRunDetails.validate_raw(obj: obj)
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
      # @return [Submission::WorkspaceSubmissionStatus] 
      def self.stopped
        new(member: nil, discriminant: "stopped")
      end
      # @param member [Submission::ErrorInfo] 
      # @return [Submission::WorkspaceSubmissionStatus] 
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end
      # @param member [Submission::RunningSubmissionState] 
      # @return [Submission::WorkspaceSubmissionStatus] 
      def self.running(member:)
        new(member: member, discriminant: "running")
      end
      # @param member [Submission::WorkspaceRunDetails] 
      # @return [Submission::WorkspaceSubmissionStatus] 
      def self.ran(member:)
        new(member: member, discriminant: "ran")
      end
      # @param member [Submission::WorkspaceRunDetails] 
      # @return [Submission::WorkspaceSubmissionStatus] 
      def self.traced(member:)
        new(member: member, discriminant: "traced")
      end
    end
  end
end