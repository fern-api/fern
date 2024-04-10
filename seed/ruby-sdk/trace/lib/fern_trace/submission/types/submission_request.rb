# frozen_string_literal: true

require "json"
require_relative "initialize_problem_request"
require_relative "submit_request_v_2"
require_relative "workspace_submit_request"
require_relative "stop_request"

module SeedTraceClient
  class Submission
    class SubmissionRequest
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Submission::SubmissionRequest]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of SubmissionRequest
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::SubmissionRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "initializeProblemRequest"
                   SeedTraceClient::Submission::InitializeProblemRequest.from_json(json_object: json_object)
                 when "initializeWorkspaceRequest"
                   nil
                 when "submitV2"
                   SeedTraceClient::Submission::SubmitRequestV2.from_json(json_object: json_object)
                 when "workspaceSubmit"
                   SeedTraceClient::Submission::WorkspaceSubmitRequest.from_json(json_object: json_object)
                 when "stop"
                   SeedTraceClient::Submission::StopRequest.from_json(json_object: json_object)
                 else
                   SeedTraceClient::Submission::InitializeProblemRequest.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "initializeProblemRequest"
          { **@member.to_json, type: @discriminant }.to_json
        when "initializeWorkspaceRequest"
          { type: @discriminant }.to_json
        when "submitV2"
          { **@member.to_json, type: @discriminant }.to_json
        when "workspaceSubmit"
          { **@member.to_json, type: @discriminant }.to_json
        when "stop"
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
        when "initializeProblemRequest"
          SeedTraceClient::Submission::InitializeProblemRequest.validate_raw(obj: obj)
        when "initializeWorkspaceRequest"
          # noop
        when "submitV2"
          SeedTraceClient::Submission::SubmitRequestV2.validate_raw(obj: obj)
        when "workspaceSubmit"
          SeedTraceClient::Submission::WorkspaceSubmitRequest.validate_raw(obj: obj)
        when "stop"
          SeedTraceClient::Submission::StopRequest.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Submission::InitializeProblemRequest]
      # @return [SeedTraceClient::Submission::SubmissionRequest]
      def self.initialize_problem_request(member:)
        new(member: member, discriminant: "initializeProblemRequest")
      end

      # @return [SeedTraceClient::Submission::SubmissionRequest]
      def self.initialize_workspace_request
        new(member: nil, discriminant: "initializeWorkspaceRequest")
      end

      # @param member [SeedTraceClient::Submission::SubmitRequestV2]
      # @return [SeedTraceClient::Submission::SubmissionRequest]
      def self.submit_v_2(member:)
        new(member: member, discriminant: "submitV2")
      end

      # @param member [SeedTraceClient::Submission::WorkspaceSubmitRequest]
      # @return [SeedTraceClient::Submission::SubmissionRequest]
      def self.workspace_submit(member:)
        new(member: member, discriminant: "workspaceSubmit")
      end

      # @param member [SeedTraceClient::Submission::StopRequest]
      # @return [SeedTraceClient::Submission::SubmissionRequest]
      def self.stop(member:)
        new(member: member, discriminant: "stop")
      end
    end
  end
end
