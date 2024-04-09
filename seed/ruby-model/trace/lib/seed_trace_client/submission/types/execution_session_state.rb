# frozen_string_literal: true

require_relative "../../commons/types/language"
require_relative "execution_session_status"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class ExecutionSessionState
      attr_reader :last_time_contacted, :session_id, :is_warm_instance, :aws_task_id, :language, :status,
                  :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param last_time_contacted [String]
      # @param session_id [String] The auto-generated session id. Formatted as a uuid.
      # @param is_warm_instance [Boolean]
      # @param aws_task_id [String]
      # @param language [SeedTraceClient::Commons::Language]
      # @param status [SeedTraceClient::Submission::ExecutionSessionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::ExecutionSessionState]
      def initialize(session_id:, is_warm_instance:, language:, status:, last_time_contacted: OMIT, aws_task_id: OMIT,
                     additional_properties: nil)
        # @type [String]
        @last_time_contacted = last_time_contacted if last_time_contacted != OMIT
        # @type [String] The auto-generated session id. Formatted as a uuid.
        @session_id = session_id
        # @type [Boolean]
        @is_warm_instance = is_warm_instance
        # @type [String]
        @aws_task_id = aws_task_id if aws_task_id != OMIT
        # @type [SeedTraceClient::Commons::Language]
        @language = language
        # @type [SeedTraceClient::Submission::ExecutionSessionStatus]
        @status = status
        @_field_set = {
          "lastTimeContacted": @last_time_contacted,
          "sessionId": @session_id,
          "isWarmInstance": @is_warm_instance,
          "awsTaskId": @aws_task_id,
          "language": @language,
          "status": @status
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of ExecutionSessionState
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::ExecutionSessionState]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        last_time_contacted = struct["lastTimeContacted"]
        session_id = struct["sessionId"]
        is_warm_instance = struct["isWarmInstance"]
        aws_task_id = struct["awsTaskId"]
        language = struct["language"]
        status = struct["status"]
        new(last_time_contacted: last_time_contacted, session_id: session_id, is_warm_instance: is_warm_instance,
            aws_task_id: aws_task_id, language: language, status: status, additional_properties: struct)
      end

      # Serialize an instance of ExecutionSessionState to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.last_time_contacted&.is_a?(String) != false || raise("Passed value for field obj.last_time_contacted is not the expected type, validation failed.")
        obj.session_id.is_a?(String) != false || raise("Passed value for field obj.session_id is not the expected type, validation failed.")
        obj.is_warm_instance.is_a?(Boolean) != false || raise("Passed value for field obj.is_warm_instance is not the expected type, validation failed.")
        obj.aws_task_id&.is_a?(String) != false || raise("Passed value for field obj.aws_task_id is not the expected type, validation failed.")
        obj.language.is_a?(SeedTraceClient::Commons::Language) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        obj.status.is_a?(SeedTraceClient::Submission::ExecutionSessionStatus) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      end
    end
  end
end
