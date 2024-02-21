# frozen_string_literal: true

require_relative "../../commons/types/language"
require_relative "execution_session_status"
require "json"

module SeedTraceClient
  class Submission
    class ExecutionSessionResponse
      attr_reader :session_id, :execution_session_url, :language, :status, :additional_properties

      # @param session_id [String]
      # @param execution_session_url [String]
      # @param language [Commons::Language]
      # @param status [Submission::ExecutionSessionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ExecutionSessionResponse]
      def initialize(session_id:, language:, status:, execution_session_url: nil, additional_properties: nil)
        # @type [String]
        @session_id = session_id
        # @type [String]
        @execution_session_url = execution_session_url
        # @type [Commons::Language]
        @language = language
        # @type [Submission::ExecutionSessionStatus]
        @status = status
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ExecutionSessionResponse
      #
      # @param json_object [JSON]
      # @return [Submission::ExecutionSessionResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        session_id = struct.sessionId
        execution_session_url = struct.executionSessionUrl
        language = struct.language
        status = struct.status
        new(session_id: session_id, execution_session_url: execution_session_url, language: language, status: status,
            additional_properties: struct)
      end

      # Serialize an instance of ExecutionSessionResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          "sessionId": @session_id,
          "executionSessionUrl": @execution_session_url,
          "language": @language,
          "status": @status
        }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.session_id.is_a?(String) != false || raise("Passed value for field obj.session_id is not the expected type, validation failed.")
        obj.execution_session_url&.is_a?(String) != false || raise("Passed value for field obj.execution_session_url is not the expected type, validation failed.")
        obj.language.is_a?(Commons::Language) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        obj.status.is_a?(Submission::ExecutionSessionStatus) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      end
    end
  end
end
