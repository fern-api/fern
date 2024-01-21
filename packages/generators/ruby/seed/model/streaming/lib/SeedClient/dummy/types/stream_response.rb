# frozen_string_literal: true
require "json"

module SeedClient
  module Dummy
    class StreamResponse
      attr_reader :id, :name, :additional_properties
      # @param id [String] 
      # @param name [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Dummy::StreamResponse] 
      def initialze(id:, name: nil, additional_properties: nil)
        # @type [String] 
        @id = id
        # @type [String] 
        @name = name
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of StreamResponse
      #
      # @param json_object [JSON] 
      # @return [Dummy::StreamResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct.id
        name = struct.name
        new(id: id, name: name, additional_properties: struct)
      end
      # Serialize an instance of StreamResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 id: @id,
 name: @name
}.to_json()
      end
    end
  end
end