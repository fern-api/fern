# frozen_string_literal: true
require "json"
require "commons/types/ProblemId"
require "submission/types/ExceptionInfo"
require "submission/types/CodeExecutionUpdate"
require "submission/types/TerminatedResponse"

module SeedClient
  module Submission
    class SubmissionResponse
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::SubmissionResponse] 
      def initialze(member:, discriminant:)
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
        case struct.type
        when "server_initialized"
          member = nil
        when "problem_initialized"
          member = Commons::ProblemId.from_json(json_object: json_object.value)
        when "workspace_initialized"
          member = nil
        when "server_errored"
          member = Submission::ExceptionInfo.from_json(json_object: json_object)
        when "code_execution_update"
          member = Submission::CodeExecutionUpdate.from_json(json_object: json_object.value)
        when "terminated"
          member = Submission::TerminatedResponse.from_json(json_object: json_object)
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
        when "server_initialized"
          { type: @discriminant }.to_json()
        when "problem_initialized"
          { type: @discriminant, value: @member }.to_json()
        when "workspace_initialized"
          { type: @discriminant }.to_json()
        when "server_errored"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "code_execution_update"
          { type: @discriminant, value: @member }.to_json()
        when "terminated"
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
        when "server_initialized"
          # noop
        when "problem_initialized"
          ProblemId.validate_raw(obj: obj)
        when "workspace_initialized"
          # noop
        when "server_errored"
          ExceptionInfo.validate_raw(obj: obj)
        when "code_execution_update"
          CodeExecutionUpdate.validate_raw(obj: obj)
        when "terminated"
          TerminatedResponse.validate_raw(obj: obj)
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
      # @return [Submission::SubmissionResponse] 
      def self.server_initialized
        new(member: nil, discriminant: "server_initialized")
      end
      # @param member [Commons::ProblemId] 
      # @return [Submission::SubmissionResponse] 
      def self.problem_initialized(member:)
        new(member: member, discriminant: "problem_initialized")
      end
      # @return [Submission::SubmissionResponse] 
      def self.workspace_initialized
        new(member: nil, discriminant: "workspace_initialized")
      end
      # @param member [Submission::ExceptionInfo] 
      # @return [Submission::SubmissionResponse] 
      def self.server_errored(member:)
        new(member: member, discriminant: "server_errored")
      end
      # @param member [Submission::CodeExecutionUpdate] 
      # @return [Submission::SubmissionResponse] 
      def self.code_execution_update(member:)
        new(member: member, discriminant: "code_execution_update")
      end
      # @param member [Submission::TerminatedResponse] 
      # @return [Submission::SubmissionResponse] 
      def self.terminated(member:)
        new(member: member, discriminant: "terminated")
      end
    end
  end
end