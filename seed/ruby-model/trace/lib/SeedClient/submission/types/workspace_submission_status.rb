# frozen_string_literal: true

require "json"
require_relative "error_info"
require_relative "workspace_run_details"

module SeedClient
  module Submission
    class WorkspaceSubmissionStatus
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::WorkspaceSubmissionStatus]
      def initialize(member:, discriminant:)
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
        member = case struct.type
                 when "stopped"
                   nil
                 when "errored"
                   Submission::ErrorInfo.from_json(json_object: json_object.value)
                 when "running"
                   RUNNING_SUBMISSION_STATE.key(json_object.value)
                 when "ran"
                   Submission::WorkspaceRunDetails.from_json(json_object: json_object)
                 when "traced"
                   Submission::WorkspaceRunDetails.from_json(json_object: json_object)
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
          { "type": @discriminant, "value": @member }.to_json
        when "running"
          { "type": @discriminant, "value": @member }.to_json
        when "ran"
          { type: @discriminant, **@member.to_json }.to_json
        when "traced"
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
        when "stopped"
          # noop
        when "errored"
          Submission::ErrorInfo.validate_raw(obj: obj)
        when "running"
          obj.is_a?(RUNNING_SUBMISSION_STATE) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "ran"
          Submission::WorkspaceRunDetails.validate_raw(obj: obj)
        when "traced"
          Submission::WorkspaceRunDetails.validate_raw(obj: obj)
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

      # @return [Submission::WorkspaceSubmissionStatus]
      def self.stopped
        new(member: nil, discriminant: "stopped")
      end

      # @param member [Submission::ErrorInfo]
      # @return [Submission::WorkspaceSubmissionStatus]
      def self.errored(member:)
        new(member: member, discriminant: "errored")
      end

      # @param member [Hash{String => String}]
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
