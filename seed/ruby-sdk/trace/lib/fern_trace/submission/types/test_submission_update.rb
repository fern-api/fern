# frozen_string_literal: true

require "date"
require_relative "test_submission_update_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TestSubmissionUpdate
      # @return [DateTime]
      attr_reader :update_time
      # @return [SeedTraceClient::Submission::TestSubmissionUpdateInfo]
      attr_reader :update_info
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param update_time [DateTime]
      # @param update_info [SeedTraceClient::Submission::TestSubmissionUpdateInfo]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TestSubmissionUpdate]
      def initialize(update_time:, update_info:, additional_properties: nil)
        @update_time = update_time
        @update_info = update_info
        @additional_properties = additional_properties
        @_field_set = { "updateTime": update_time, "updateInfo": update_info }
      end

      # Deserialize a JSON object to an instance of TestSubmissionUpdate
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TestSubmissionUpdate]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        update_time = (DateTime.parse(parsed_json["updateTime"]) unless parsed_json["updateTime"].nil?)
        if parsed_json["updateInfo"].nil?
          update_info = nil
        else
          update_info = parsed_json["updateInfo"].to_json
          update_info = SeedTraceClient::Submission::TestSubmissionUpdateInfo.from_json(json_object: update_info)
        end
        new(
          update_time: update_time,
          update_info: update_info,
          additional_properties: struct
        )
      end

      # Serialize an instance of TestSubmissionUpdate to a JSON object
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
        obj.update_time.is_a?(DateTime) != false || raise("Passed value for field obj.update_time is not the expected type, validation failed.")
        SeedTraceClient::Submission::TestSubmissionUpdateInfo.validate_raw(obj: obj.update_info)
      end
    end
  end
end
