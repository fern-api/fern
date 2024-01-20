# frozen_string_literal: true

module SeedClient
  module Submission
    class ExecutionSessionResponse
      attr_reader :session_id, :execution_session_url, :language, :status, :additional_properties

      # @param session_id [String]
      # @param execution_session_url [String]
      # @param language [Commons::Language]
      # @param status [Submission::ExecutionSessionStatus]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ExecutionSessionResponse]
      def initialze(session_id:, language:, status:, execution_session_url: nil, additional_properties: nil)
        # @type [String]
        @session_id = session_id
        # @type [String]
        @execution_session_url = execution_session_url
        # @type [Commons::Language]
        @language = language
        # @type [Submission::ExecutionSessionStatus]
        @status = status
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ExecutionSessionResponse
      #
      # @param json_object [JSON]
      # @return [Submission::ExecutionSessionResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        session_id = struct.sessionId
        execution_session_url = struct.executionSessionUrl
        language = Commons::Language.from_json(json_object: struct.language)
        status = Submission::ExecutionSessionStatus.from_json(json_object: struct.status)
        new(session_id: session_id, execution_session_url: execution_session_url, language: language, status: status,
            additional_properties: struct)
      end

      # Serialize an instance of ExecutionSessionResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          sessionId: @session_id,
          executionSessionUrl: @execution_session_url,
          language: @language,
          status: @status
        }.to_json
      end
    end
  end
end
