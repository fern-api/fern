# frozen_string_literal: true

require "json"
require_relative "exception_info"
require_relative "code_execution_update"
require_relative "terminated_response"
require_relative "../../commons/types/problem_id"

module SeedClient
  module Submission
    class SubmissionResponse
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::SubmissionResponse]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of SubmissionResponse
      #
      # @param json_object [JSON]
      # @return [Submission::SubmissionResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "serverInitialized"
                   nil
                 when "problemInitialized"
                   json_object.value
                 when "workspaceInitialized"
                   nil
                 when "serverErrored"
                   Submission::ExceptionInfo.from_json(json_object: json_object)
                 when "codeExecutionUpdate"
                   Submission::CodeExecutionUpdate.from_json(json_object: json_object.value)
                 when "terminated"
                   Submission::TerminatedResponse.from_json(json_object: json_object)
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
        when "serverInitialized"
          { type: @discriminant }.to_json
        when "problemInitialized"
          { "type": @discriminant, "value": @member }.to_json
        when "workspaceInitialized"
          { type: @discriminant }.to_json
        when "serverErrored"
          { type: @discriminant, **@member.to_json }.to_json
        when "codeExecutionUpdate"
          { "type": @discriminant, "value": @member }.to_json
        when "terminated"
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
        when "serverInitialized"
          # noop
        when "problemInitialized"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "workspaceInitialized"
          # noop
        when "serverErrored"
          Submission::ExceptionInfo.validate_raw(obj: obj)
        when "codeExecutionUpdate"
          Submission::CodeExecutionUpdate.validate_raw(obj: obj)
        when "terminated"
          Submission::TerminatedResponse.validate_raw(obj: obj)
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

      # @return [Submission::SubmissionResponse]
      def self.server_initialized
        new(member: nil, discriminant: "serverInitialized")
      end

      # @param member [Commons::PROBLEM_ID]
      # @return [Submission::SubmissionResponse]
      def self.problem_initialized(member:)
        new(member: member, discriminant: "problemInitialized")
      end

      # @return [Submission::SubmissionResponse]
      def self.workspace_initialized
        new(member: nil, discriminant: "workspaceInitialized")
      end

      # @param member [Submission::ExceptionInfo]
      # @return [Submission::SubmissionResponse]
      def self.server_errored(member:)
        new(member: member, discriminant: "serverErrored")
      end

      # @param member [Submission::CodeExecutionUpdate]
      # @return [Submission::SubmissionResponse]
      def self.code_execution_update(member:)
        new(member: member, discriminant: "codeExecutionUpdate")
      end

      # @param member [Submission::TerminatedResponse]
      # @return [Submission::SubmissionResponse]
      def self.terminated(member:)
        new(member: member, discriminant: "terminated")
      end
    end
  end
end
