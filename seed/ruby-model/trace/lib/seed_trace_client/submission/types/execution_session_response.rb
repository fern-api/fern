# frozen_string_literal: true

require_relative "../../commons/types/language"
require_relative "execution_session_status"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class ExecutionSessionResponse
      # @return [String]
      attr_reader :session_id
      # @return [String]
      attr_reader :execution_session_url
      # @return [SeedTraceClient::Commons::Language]
      attr_reader :language
      # @return [SeedTraceClient::Submission::ExecutionSessionStatus]
      attr_reader :status
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param session_id [String]
      # @param execution_session_url [String]
      # @param language [SeedTraceClient::Commons::Language]
      # @param status [SeedTraceClient::Submission::ExecutionSessionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::ExecutionSessionResponse]
      def initialize(session_id:, language:, status:, execution_session_url: OMIT, additional_properties: nil)
        @session_id = session_id
        @execution_session_url = execution_session_url if execution_session_url != OMIT
        @language = language
        @status = status
        @additional_properties = additional_properties
        @_field_set = {
          "sessionId": session_id,
          "executionSessionUrl": execution_session_url,
          "language": language,
          "status": status
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of ExecutionSessionResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::ExecutionSessionResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        session_id = parsed_json["sessionId"]
        execution_session_url = parsed_json["executionSessionUrl"]
        language = parsed_json["language"]
        status = parsed_json["status"]
        new(
          session_id: session_id,
          execution_session_url: execution_session_url,
          language: language,
          status: status,
          additional_properties: struct
        )
      end

      # Serialize an instance of ExecutionSessionResponse to a JSON object
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
        obj.session_id.is_a?(String) != false || raise("Passed value for field obj.session_id is not the expected type, validation failed.")
        obj.execution_session_url&.is_a?(String) != false || raise("Passed value for field obj.execution_session_url is not the expected type, validation failed.")
        obj.language.is_a?(SeedTraceClient::Commons::Language) != false || raise("Passed value for field obj.language is not the expected type, validation failed.")
        obj.status.is_a?(SeedTraceClient::Submission::ExecutionSessionStatus) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      end
    end
  end
end
