# frozen_string_literal: true

require_relative "workspace_submission_update"
require "json"

module SeedTraceClient
  module Submission
    class WorkspaceSubmissionStatusV2
      attr_reader :updates, :additional_properties

      # @param updates [Array<Submission::WorkspaceSubmissionUpdate>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceSubmissionStatusV2]
      def initialize(updates:, additional_properties: nil)
        # @type [Array<Submission::WorkspaceSubmissionUpdate>]
        @updates = updates
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmissionStatusV2
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceSubmissionStatusV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        updates = struct.updates
        new(updates: updates, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceSubmissionStatusV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "updates": @updates }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.updates.is_a?(Array) != false || raise("Passed value for field obj.updates is not the expected type, validation failed.")
      end
    end
  end
end
