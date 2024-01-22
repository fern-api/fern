# frozen_string_literal: true
require "types/WithMetadata"
require "service/types/WithDocs"
require "service/types/Movie"
require "json"

module SeedClient
  module Service
    class Response < WithMetadata, WithDocs
      attr_reader :data, :additional_properties
      # @param data [Service::Movie] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::Response] 
      def initialze(data:, additional_properties: nil)
        # @type [Service::Movie] 
        @data = data
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Response
      #
      # @param json_object [JSON] 
      # @return [Service::Response] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        data Service::Movie.from_json(json_object: struct.data)
        new(data: data, additional_properties: struct)
      end
      # Serialize an instance of Response to a JSON object
      #
      # @return [JSON] 
      def to_json
        { data: @data }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        Movie.validate_raw(obj: obj.data)
      end
    end
  end
end