# frozen_string_literal: true
require "commons/types/Language"
require "submission/types/ExecutionSessionStatus"
require "json"

module SeedClient
  module Submission
    class ExecutionSessionState
      attr_reader :last_time_contacted, :session_id, :is_warm_instance, :aws_task_id, :language, :status, :additional_properties
      # @param last_time_contacted [String] 
      # @param session_id [String] The auto-generated session id. Formatted as a uuid.
      # @param is_warm_instance [Boolean] 
      # @param aws_task_id [String] 
      # @param language [Commons::Language] 
      # @param status [Submission::ExecutionSessionStatus] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ExecutionSessionState] 
      def initialze(last_time_contacted: nil, session_id:, is_warm_instance:, aws_task_id: nil, language:, status:, additional_properties: nil)
        # @type [String] 
        @last_time_contacted = last_time_contacted
        # @type [String] 
        @session_id = session_id
        # @type [Boolean] 
        @is_warm_instance = is_warm_instance
        # @type [String] 
        @aws_task_id = aws_task_id
        # @type [Commons::Language] 
        @language = language
        # @type [Submission::ExecutionSessionStatus] 
        @status = status
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ExecutionSessionState
      #
      # @param json_object [JSON] 
      # @return [Submission::ExecutionSessionState] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        last_time_contacted = struct.lastTimeContacted
        session_id = struct.sessionId
        is_warm_instance = struct.isWarmInstance
        aws_task_id = struct.awsTaskId
        language = Commons::Language.from_json(json_object: struct.language)
        status = Submission::ExecutionSessionStatus.from_json(json_object: struct.status)
        new(last_time_contacted: last_time_contacted, session_id: session_id, is_warm_instance: is_warm_instance, aws_task_id: aws_task_id, language: language, status: status, additional_properties: struct)
      end
      # Serialize an instance of ExecutionSessionState to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 lastTimeContacted: @last_time_contacted,
 sessionId: @session_id,
 isWarmInstance: @is_warm_instance,
 awsTaskId: @aws_task_id,
 language: @language,
 status: @status
}.to_json()
      end
    end
  end
end