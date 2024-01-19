# frozen_string_literal: true
require "json"

module SeedClient
  module Literal
    class Options
      attr_reader :id, :enabled, :values, :additional_properties
      # @param id [String] 
      # @param enabled [Boolean] 
      # @param values [Hash{String => String}] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Literal::Options] 
      def initialze(id:, enabled:, values:, additional_properties: nil)
        # @type [String] 
        @id = id
        # @type [Boolean] 
        @enabled = enabled
        # @type [Hash{String => String}] 
        @values = values
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Options
      #
      # @param json_object [JSON] 
      # @return [Literal::Options] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct.id
        enabled = struct.enabled
        values = struct.values
        new(id: id, enabled: enabled, values: values, additional_properties: struct)
      end
      # Serialize an instance of Options to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 id: @id,
 enabled: @enabled,
 values: @values
}.to_json()
      end
    end
  end
end