# frozen_string_literal: true

require "json"
require_relative "debug_map_value"
require_relative "binary_tree_node_and_tree_value"
require_relative "singly_linked_list_node_and_list_value"
require_relative "doubly_linked_list_node_and_list_value"
require_relative "generic_value"

module SeedTraceClient
  class Commons
    class DebugVariableValue
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of DebugVariableValue
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "integerValue"
                   json_object.value
                 when "booleanValue"
                   json_object.value
                 when "doubleValue"
                   json_object.value
                 when "stringValue"
                   json_object.value
                 when "charValue"
                   json_object.value
                 when "mapValue"
                   SeedTraceClient::Commons::DebugMapValue.from_json(json_object: json_object)
                 when "listValue"
                   json_object.value&.map do |item|
                     item = item.to_json
                     SeedTraceClient::Commons::DebugVariableValue.from_json(json_object: item)
                   end
                 when "binaryTreeNodeValue"
                   SeedTraceClient::Commons::BinaryTreeNodeAndTreeValue.from_json(json_object: json_object)
                 when "singlyLinkedListNodeValue"
                   SeedTraceClient::Commons::SinglyLinkedListNodeAndListValue.from_json(json_object: json_object)
                 when "doublyLinkedListNodeValue"
                   SeedTraceClient::Commons::DoublyLinkedListNodeAndListValue.from_json(json_object: json_object)
                 when "undefinedValue"
                   nil
                 when "nullValue"
                   nil
                 when "genericValue"
                   SeedTraceClient::Commons::GenericValue.from_json(json_object: json_object)
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "integerValue"
          { "type": @discriminant, "value": @member }.to_json
        when "booleanValue"
          { "type": @discriminant, "value": @member }.to_json
        when "doubleValue"
          { "type": @discriminant, "value": @member }.to_json
        when "stringValue"
          { "type": @discriminant, "value": @member }.to_json
        when "charValue"
          { "type": @discriminant, "value": @member }.to_json
        when "mapValue"
          { **@member.to_json, type: @discriminant }.to_json
        when "listValue"
          { "type": @discriminant, "value": @member }.to_json
        when "binaryTreeNodeValue"
          { **@member.to_json, type: @discriminant }.to_json
        when "singlyLinkedListNodeValue"
          { **@member.to_json, type: @discriminant }.to_json
        when "doublyLinkedListNodeValue"
          { **@member.to_json, type: @discriminant }.to_json
        when "undefinedValue"
          { type: @discriminant }.to_json
        when "nullValue"
          { type: @discriminant }.to_json
        when "genericValue"
          { **@member.to_json, type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "integerValue"
          obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "booleanValue"
          obj.is_a?(Boolean) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "doubleValue"
          obj.is_a?(Float) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "stringValue"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "charValue"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "mapValue"
          SeedTraceClient::Commons::DebugMapValue.validate_raw(obj: obj)
        when "listValue"
          obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "binaryTreeNodeValue"
          SeedTraceClient::Commons::BinaryTreeNodeAndTreeValue.validate_raw(obj: obj)
        when "singlyLinkedListNodeValue"
          SeedTraceClient::Commons::SinglyLinkedListNodeAndListValue.validate_raw(obj: obj)
        when "doublyLinkedListNodeValue"
          SeedTraceClient::Commons::DoublyLinkedListNodeAndListValue.validate_raw(obj: obj)
        when "undefinedValue"
          # noop
        when "nullValue"
          # noop
        when "genericValue"
          SeedTraceClient::Commons::GenericValue.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [Integer]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.integer_value(member:)
        new(member: member, discriminant: "integerValue")
      end

      # @param member [Boolean]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.boolean_value(member:)
        new(member: member, discriminant: "booleanValue")
      end

      # @param member [Float]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.double_value(member:)
        new(member: member, discriminant: "doubleValue")
      end

      # @param member [String]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.string_value(member:)
        new(member: member, discriminant: "stringValue")
      end

      # @param member [String]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.char_value(member:)
        new(member: member, discriminant: "charValue")
      end

      # @param member [SeedTraceClient::Commons::DebugMapValue]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.map_value(member:)
        new(member: member, discriminant: "mapValue")
      end

      # @param member [Array<SeedTraceClient::Commons::DebugVariableValue>]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.list_value(member:)
        new(member: member, discriminant: "listValue")
      end

      # @param member [SeedTraceClient::Commons::BinaryTreeNodeAndTreeValue]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.binary_tree_node_value(member:)
        new(member: member, discriminant: "binaryTreeNodeValue")
      end

      # @param member [SeedTraceClient::Commons::SinglyLinkedListNodeAndListValue]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.singly_linked_list_node_value(member:)
        new(member: member, discriminant: "singlyLinkedListNodeValue")
      end

      # @param member [SeedTraceClient::Commons::DoublyLinkedListNodeAndListValue]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.doubly_linked_list_node_value(member:)
        new(member: member, discriminant: "doublyLinkedListNodeValue")
      end

      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.undefined_value
        new(member: nil, discriminant: "undefinedValue")
      end

      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.null_value
        new(member: nil, discriminant: "nullValue")
      end

      # @param member [SeedTraceClient::Commons::GenericValue]
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      def self.generic_value(member:)
        new(member: member, discriminant: "genericValue")
      end
    end
  end
end
