# frozen_string_literal: true

require_relative "workspace_submission_status"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceSubmissionState
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionStatus]
      attr_reader :status
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param status [SeedTraceClient::Submission::WorkspaceSubmissionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionState]
      def initialize(status:, additional_properties: nil)
        @status = status
        @additional_properties = additional_properties
        @_field_set = { "status": status }
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmissionState
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionState]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["status"].nil?
          status = nil
        else
          status = parsed_json["status"].to_json
          status = SeedTraceClient::Submission::WorkspaceSubmissionStatus.from_json(json_object: status)
        end
        new(status: status, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceSubmissionState to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        SeedTraceClient::Submission::WorkspaceSubmissionStatus.validate_raw(obj: obj.status)
      end
    end
  end
end
