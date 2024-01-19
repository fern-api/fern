# frozen_string_literal: true
require "json"

module SeedClient
  module LangServer
    class LangServerResponse
      attr_reader :response, :additional_properties
      # @param response [Object] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [LangServer::LangServerResponse] 
      def initialze(response:, additional_properties: nil)
        # @type [Object] 
        @response = response
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of LangServerResponse
      #
      # @param json_object [JSON] 
      # @return [LangServer::LangServerResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        response = struct.response
        new(response: response, additional_properties: struct)
      end
      # Serialize an instance of LangServerResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 response: @response
}.to_json()
      end
    end
  end
end