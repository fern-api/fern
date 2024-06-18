# frozen_string_literal: true

require_relative "node"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Tree
      # @return [Array<SeedExamplesClient::Types::Node>]
      attr_reader :nodes
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param nodes [Array<SeedExamplesClient::Types::Node>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Tree]
      def initialize(nodes: OMIT, additional_properties: nil)
        @nodes = nodes if nodes != OMIT
        @additional_properties = additional_properties
        @_field_set = { "nodes": nodes }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Tree
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Tree]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        nodes = parsed_json["nodes"]&.map do |item|
          item = item.to_json
          SeedExamplesClient::Types::Node.from_json(json_object: item)
        end
        new(nodes: nodes, additional_properties: struct)
      end

      # Serialize an instance of Tree to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.nodes&.is_a?(Array) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
      end
    end
  end
end
