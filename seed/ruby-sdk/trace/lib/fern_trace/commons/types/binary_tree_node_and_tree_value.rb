# frozen_string_literal: true

require_relative "binary_tree_value"
require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class BinaryTreeNodeAndTreeValue
      # @return [String]
      attr_reader :node_id
      # @return [SeedTraceClient::Commons::BinaryTreeValue]
      attr_reader :full_tree
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param node_id [String]
      # @param full_tree [SeedTraceClient::Commons::BinaryTreeValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::BinaryTreeNodeAndTreeValue]
      def initialize(node_id:, full_tree:, additional_properties: nil)
        @node_id = node_id
        @full_tree = full_tree
        @additional_properties = additional_properties
        @_field_set = { "nodeId": node_id, "fullTree": full_tree }
      end

      # Deserialize a JSON object to an instance of BinaryTreeNodeAndTreeValue
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::BinaryTreeNodeAndTreeValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        node_id = parsed_json["nodeId"]
        if parsed_json["fullTree"].nil?
          full_tree = nil
        else
          full_tree = parsed_json["fullTree"].to_json
          full_tree = SeedTraceClient::Commons::BinaryTreeValue.from_json(json_object: full_tree)
        end
        new(
          node_id: node_id,
          full_tree: full_tree,
          additional_properties: struct
        )
      end

      # Serialize an instance of BinaryTreeNodeAndTreeValue to a JSON object
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
        obj.node_id.is_a?(String) != false || raise("Passed value for field obj.node_id is not the expected type, validation failed.")
        SeedTraceClient::Commons::BinaryTreeValue.validate_raw(obj: obj.full_tree)
      end
    end
  end
end
