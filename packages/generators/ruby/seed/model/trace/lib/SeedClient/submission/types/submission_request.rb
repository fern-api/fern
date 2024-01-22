# frozen_string_literal: true
require "json"
require "submission/types/InitializeProblemRequest"
require "submission/types/SubmitRequestV2"
require "submission/types/WorkspaceSubmitRequest"
require "submission/types/StopRequest"

module SeedClient
  module Submission
    class SubmissionRequest
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::SubmissionRequest] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of SubmissionRequest
      #
      # @param json_object [JSON] 
      # @return [Submission::SubmissionRequest] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "initialize_problem_request"
          member = Submission::InitializeProblemRequest.from_json(json_object: json_object)
        when "initialize_workspace_request"
          member = nil
        when "submit_v_2"
          member = Submission::SubmitRequestV2.from_json(json_object: json_object)
        when "workspace_submit"
          member = Submission::WorkspaceSubmitRequest.from_json(json_object: json_object)
        when "stop"
          member = Submission::StopRequest.from_json(json_object: json_object)
        else
          member = Submission::InitializeProblemRequest.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "initialize_problem_request"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "initialize_workspace_request"
          { type: @discriminant }.to_json()
        when "submit_v_2"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "workspace_submit"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "stop"
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
        when "initialize_problem_request"
          InitializeProblemRequest.validate_raw(obj: obj)
        when "initialize_workspace_request"
          # noop
        when "submit_v_2"
          SubmitRequestV2.validate_raw(obj: obj)
        when "workspace_submit"
          WorkspaceSubmitRequest.validate_raw(obj: obj)
        when "stop"
          StopRequest.validate_raw(obj: obj)
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
      # @param member [Submission::InitializeProblemRequest] 
      # @return [Submission::SubmissionRequest] 
      def self.initialize_problem_request(member:)
        new(member: member, discriminant: "initialize_problem_request")
      end
      # @return [Submission::SubmissionRequest] 
      def self.initialize_workspace_request
        new(member: nil, discriminant: "initialize_workspace_request")
      end
      # @param member [Submission::SubmitRequestV2] 
      # @return [Submission::SubmissionRequest] 
      def self.submit_v_2(member:)
        new(member: member, discriminant: "submit_v_2")
      end
      # @param member [Submission::WorkspaceSubmitRequest] 
      # @return [Submission::SubmissionRequest] 
      def self.workspace_submit(member:)
        new(member: member, discriminant: "workspace_submit")
      end
      # @param member [Submission::StopRequest] 
      # @return [Submission::SubmissionRequest] 
      def self.stop(member:)
        new(member: member, discriminant: "stop")
      end
    end
  end
end