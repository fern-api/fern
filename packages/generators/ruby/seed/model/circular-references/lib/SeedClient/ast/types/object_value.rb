# frozen_string_literal: true
require "json"

module SeedClient
  module Ast
    class ObjectValue
      attr_reader :additional_properties
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Ast::ObjectValue] 
      def initialze(additional_properties: nil)
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ObjectValue
      #
      # @param json_object [JSON] 
      # @return [Ast::ObjectValue] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        new(additional_properties: struct)
      end
      # Serialize an instance of ObjectValue to a JSON object
      #
      # @return [JSON] 
      def to_json
        {}.to_json()
      end
    end
  end
end