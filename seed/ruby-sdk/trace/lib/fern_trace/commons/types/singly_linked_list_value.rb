# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class SinglyLinkedListValue
      # @return [String]
      attr_reader :head
      # @return [Hash{String => SeedTraceClient::Commons::SinglyLinkedListNodeValue}]
      attr_reader :nodes
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param head [String]
      # @param nodes [Hash{String => SeedTraceClient::Commons::SinglyLinkedListNodeValue}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::SinglyLinkedListValue]
      def initialize(nodes:, head: OMIT, additional_properties: nil)
        @head = head if head != OMIT
        @nodes = nodes
        @additional_properties = additional_properties
        @_field_set = { "head": head, "nodes": nodes }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SinglyLinkedListValue
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::SinglyLinkedListValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        head = parsed_json["head"]
        nodes = parsed_json["nodes"]&.transform_values do |value|
          value = value.to_json
          SeedTraceClient::Commons::SinglyLinkedListNodeValue.from_json(json_object: value)
        end
        new(
          head: head,
          nodes: nodes,
          additional_properties: struct
        )
      end

      # Serialize an instance of SinglyLinkedListValue to a JSON object
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
        obj.head&.is_a?(String) != false || raise("Passed value for field obj.head is not the expected type, validation failed.")
        obj.nodes.is_a?(Hash) != false || raise("Passed value for field obj.nodes is not the expected type, validation failed.")
      end
    end
  end
end
