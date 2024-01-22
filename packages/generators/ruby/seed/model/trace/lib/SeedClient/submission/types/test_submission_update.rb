# frozen_string_literal: true

require_relative "submission/types/TestSubmissionUpdateInfo"
require "json"

module SeedClient
  module Submission
    class TestSubmissionUpdate
      attr_reader :update_time, :update_info, :additional_properties

      # @param update_time [DateTime]
      # @param update_info [Submission::TestSubmissionUpdateInfo]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestSubmissionUpdate]
      def initialze(update_time:, update_info:, additional_properties: nil)
        # @type [DateTime]
        @update_time = update_time
        # @type [Submission::TestSubmissionUpdateInfo]
        @update_info = update_info
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestSubmissionUpdate
      #
      # @param json_object [JSON]
      # @return [Submission::TestSubmissionUpdate]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        update_time = struct.updateTime
        update_info = Submission::TestSubmissionUpdateInfo.from_json(json_object: struct.updateInfo)
        new(update_time: update_time, update_info: update_info, additional_properties: struct)
      end

      # Serialize an instance of TestSubmissionUpdate to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { updateTime: @update_time, updateInfo: @update_info }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.update_time.is_a?(DateTime) != false || raise("Passed value for field obj.update_time is not the expected type, validation failed.")
        Submission::TestSubmissionUpdateInfo.validate_raw(obj: obj.update_info)
      end
    end
  end
end
