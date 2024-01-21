# frozen_string_literal: true
require "json"

module SeedClient
  module Types
    class Request
      attr_reader :request, :additional_properties
      # @param request [Object] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Request] 
      def initialze(request:, additional_properties: nil)
        # @type [Object] 
        @request = request
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Request
      #
      # @param json_object [JSON] 
      # @return [Types::Request] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        request = struct.request
        new(request: request, additional_properties: struct)
      end
      # Serialize an instance of Request to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 request: @request
}.to_json()
      end
    end
  end
end