# frozen_string_literal: true

require_relative "workspace_submission_status"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceSubmissionState
      attr_reader :status, :additional_properties

      # @param status [Submission::WorkspaceSubmissionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceSubmissionState]
      def initialize(status:, additional_properties: nil)
        # @type [Submission::WorkspaceSubmissionStatus]
        @status = status
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmissionState
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceSubmissionState]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["status"].nil?
          status = nil
        else
          status = parsed_json["status"].to_json
          status = Submission::WorkspaceSubmissionStatus.from_json(json_object: status)
        end
        new(status: status, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceSubmissionState to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "status": @status }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Submission::WorkspaceSubmissionStatus.validate_raw(obj: obj.status)
      end
    end
  end
end
