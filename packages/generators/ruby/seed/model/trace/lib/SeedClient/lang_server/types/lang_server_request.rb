# frozen_string_literal: true

require "json"

module SeedClient
  module LangServer
    class LangServerRequest
      attr_reader :request, :additional_properties

      # @param request [Object]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [LangServer::LangServerRequest]
      def initialze(request:, additional_properties: nil)
        # @type [Object]
        @request = request
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of LangServerRequest
      #
      # @param json_object [JSON]
      # @return [LangServer::LangServerRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        request = struct.request
        new(request: request, additional_properties: struct)
      end

      # Serialize an instance of LangServerRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          request: @request
        }.to_json
      end
    end
  end
end
