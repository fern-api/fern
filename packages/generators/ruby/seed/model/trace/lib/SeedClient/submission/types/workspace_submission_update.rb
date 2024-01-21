# frozen_string_literal: true
require "submission/types/WorkspaceSubmissionUpdateInfo"
require "json"

module SeedClient
  module Submission
    class WorkspaceSubmissionUpdate
      attr_reader :update_time, :update_info, :additional_properties
      # @param update_time [DateTime] 
      # @param update_info [Submission::WorkspaceSubmissionUpdateInfo] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceSubmissionUpdate] 
      def initialze(update_time:, update_info:, additional_properties: nil)
        # @type [DateTime] 
        @update_time = update_time
        # @type [Submission::WorkspaceSubmissionUpdateInfo] 
        @update_info = update_info
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of WorkspaceSubmissionUpdate
      #
      # @param json_object [JSON] 
      # @return [Submission::WorkspaceSubmissionUpdate] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        update_time = struct.updateTime
        update_info = Submission::WorkspaceSubmissionUpdateInfo.from_json(json_object: struct.updateInfo)
        new(update_time: update_time, update_info: update_info, additional_properties: struct)
      end
      # Serialize an instance of WorkspaceSubmissionUpdate to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 updateTime: @update_time,
 updateInfo: @update_info
}.to_json()
      end
    end
  end
end