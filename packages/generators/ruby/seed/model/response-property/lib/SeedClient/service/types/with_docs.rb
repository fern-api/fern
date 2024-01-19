# frozen_string_literal: true
require "json"

module SeedClient
  module Service
    class WithDocs
      attr_reader :docs, :additional_properties
      # @param docs [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::WithDocs] 
      def initialze(docs:, additional_properties: nil)
        # @type [String] 
        @docs = docs
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of WithDocs
      #
      # @param json_object [JSON] 
      # @return [Service::WithDocs] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        docs = struct.docs
        new(docs: docs, additional_properties: struct)
      end
      # Serialize an instance of WithDocs to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 docs: @docs
}.to_json()
      end
    end
  end
end