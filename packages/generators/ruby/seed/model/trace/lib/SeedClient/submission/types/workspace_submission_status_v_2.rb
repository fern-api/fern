# frozen_string_literal: true

require_relative "submission/types/WorkspaceSubmissionUpdate"
require "json"

module SeedClient
  module Submission
    class WorkspaceSubmissionStatusV2
      attr_reader :updates, :additional_properties

      # @param updates [Array<Submission::WorkspaceSubmissionUpdate>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceSubmissionStatusV2]
      def initialze(updates:, additional_properties: nil)
        # @type [Array<Submission::WorkspaceSubmissionUpdate>]
        @updates = updates
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmissionStatusV2
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceSubmissionStatusV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        updates = struct.updates.map do |v|
          Submission::WorkspaceSubmissionUpdate.from_json(json_object: v)
        end
        new(updates: updates, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceSubmissionStatusV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          updates: @updates
        }.to_json
      end
    end
  end
end
