# frozen_string_literal: true

require "json"
require_relative "map_value"
require_relative "binary_tree_value"
require_relative "singly_linked_list_value"
require_relative "doubly_linked_list_value"

module SeedClient
  module Commons
    class VariableValue
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Commons::VariableValue]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of VariableValue
      #
      # @param json_object [JSON]
      # @return [Commons::VariableValue]
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
                   Commons::MapValue.from_json(json_object: json_object)
                 when "listValue"
                   json_object.value.map do |v|
                     v = v.to_h.to_json
                     Commons::VariableValue.from_json(json_object: v)
                   end
                 when "binaryTreeValue"
                   Commons::BinaryTreeValue.from_json(json_object: json_object)
                 when "singlyLinkedListValue"
                   Commons::SinglyLinkedListValue.from_json(json_object: json_object)
                 when "doublyLinkedListValue"
                   Commons::DoublyLinkedListValue.from_json(json_object: json_object)
                 when "nullValue"
                   nil
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
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
          { type: @discriminant, **@member.to_json }.to_json
        when "listValue"
          { "type": @discriminant, "value": @member }.to_json
        when "binaryTreeValue"
          { type: @discriminant, **@member.to_json }.to_json
        when "singlyLinkedListValue"
          { type: @discriminant, **@member.to_json }.to_json
        when "doublyLinkedListValue"
          { type: @discriminant, **@member.to_json }.to_json
        when "nullValue"
          { type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
          Commons::MapValue.validate_raw(obj: obj)
        when "listValue"
          obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "binaryTreeValue"
          Commons::BinaryTreeValue.validate_raw(obj: obj)
        when "singlyLinkedListValue"
          Commons::SinglyLinkedListValue.validate_raw(obj: obj)
        when "doublyLinkedListValue"
          Commons::DoublyLinkedListValue.validate_raw(obj: obj)
        when "nullValue"
          # noop
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
      # @return [Commons::VariableValue]
      def self.integer_value(member:)
        new(member: member, discriminant: "integerValue")
      end

      # @param member [Boolean]
      # @return [Commons::VariableValue]
      def self.boolean_value(member:)
        new(member: member, discriminant: "booleanValue")
      end

      # @param member [Float]
      # @return [Commons::VariableValue]
      def self.double_value(member:)
        new(member: member, discriminant: "doubleValue")
      end

      # @param member [String]
      # @return [Commons::VariableValue]
      def self.string_value(member:)
        new(member: member, discriminant: "stringValue")
      end

      # @param member [String]
      # @return [Commons::VariableValue]
      def self.char_value(member:)
        new(member: member, discriminant: "charValue")
      end

      # @param member [Commons::MapValue]
      # @return [Commons::VariableValue]
      def self.map_value(member:)
        new(member: member, discriminant: "mapValue")
      end

      # @param member [Array<Commons::VariableValue>]
      # @return [Commons::VariableValue]
      def self.list_value(member:)
        new(member: member, discriminant: "listValue")
      end

      # @param member [Commons::BinaryTreeValue]
      # @return [Commons::VariableValue]
      def self.binary_tree_value(member:)
        new(member: member, discriminant: "binaryTreeValue")
      end

      # @param member [Commons::SinglyLinkedListValue]
      # @return [Commons::VariableValue]
      def self.singly_linked_list_value(member:)
        new(member: member, discriminant: "singlyLinkedListValue")
      end

      # @param member [Commons::DoublyLinkedListValue]
      # @return [Commons::VariableValue]
      def self.doubly_linked_list_value(member:)
        new(member: member, discriminant: "doublyLinkedListValue")
      end

      # @return [Commons::VariableValue]
      def self.null_value
        new(member: nil, discriminant: "nullValue")
      end
    end
  end
end
