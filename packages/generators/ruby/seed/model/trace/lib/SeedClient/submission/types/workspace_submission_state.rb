# frozen_string_literal: true
require "submission/types/WorkspaceSubmissionStatus"
require "json"

module SeedClient
  module Submission
    class WorkspaceSubmissionState
      attr_reader :status, :additional_properties
      # @param status [Submission::WorkspaceSubmissionStatus] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceSubmissionState] 
      def initialze(status:, additional_properties: nil)
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
        status Submission::WorkspaceSubmissionStatus.from_json(json_object: struct.status)
        new(status: status, additional_properties: struct)
      end
      # Serialize an instance of WorkspaceSubmissionState to a JSON object
      #
      # @return [JSON] 
      def to_json
        { status: @status }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        WorkspaceSubmissionStatus.validate_raw(obj: obj.status)
      end
    end
  end
end