# frozen_string_literal: true

require_relative "workspace_submission_update"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceSubmissionStatusV2
      # @return [Array<SeedTraceClient::Submission::WorkspaceSubmissionUpdate>]
      attr_reader :updates
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param updates [Array<SeedTraceClient::Submission::WorkspaceSubmissionUpdate>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionStatusV2]
      def initialize(updates:, additional_properties: nil)
        @updates = updates
        @additional_properties = additional_properties
        @_field_set = { "updates": updates }
      end

      # Deserialize a JSON object to an instance of WorkspaceSubmissionStatusV2
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceSubmissionStatusV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        updates = parsed_json["updates"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Submission::WorkspaceSubmissionUpdate.from_json(json_object: item)
        end
        new(updates: updates, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceSubmissionStatusV2 to a JSON object
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
        obj.updates.is_a?(Array) != false || raise("Passed value for field obj.updates is not the expected type, validation failed.")
      end
    end
  end
end
