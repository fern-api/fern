# frozen_string_literal: true
require "json"
require "commons/types/MapValue"
require "commons/types/BinaryTreeValue"
require "commons/types/SinglyLinkedListValue"
require "commons/types/DoublyLinkedListValue"
require "commons/types/VariableValue"

module SeedClient
  module Commons
    class VariableValue
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Commons::VariableValue] 
      def initialze(member:, discriminant:)
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
        case struct.type
        when "integerValue"
          member = json_object.value
        when "booleanValue"
          member = json_object.value
        when "doubleValue"
          member = json_object.value
        when "stringValue"
          member = json_object.value
        when "charValue"
          member = json_object.value
        when "mapValue"
          member = Commons::MapValue.from_json(json_object: json_object)
        when "listValue"
          member = json_object.value.map() do | v |
  Commons::VariableValue.from_json(json_object: v)
end
        when "binaryTreeValue"
          member = Commons::BinaryTreeValue.from_json(json_object: json_object)
        when "singlyLinkedListValue"
          member = Commons::SinglyLinkedListValue.from_json(json_object: json_object)
        when "doublyLinkedListValue"
          member = Commons::DoublyLinkedListValue.from_json(json_object: json_object)
        when "nullValue"
          member = nil
        else
          member = json_object
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "integerValue"
          { type: @discriminant, value: @member }.to_json()
        when "booleanValue"
          { type: @discriminant, value: @member }.to_json()
        when "doubleValue"
          { type: @discriminant, value: @member }.to_json()
        when "stringValue"
          { type: @discriminant, value: @member }.to_json()
        when "charValue"
          { type: @discriminant, value: @member }.to_json()
        when "mapValue"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "listValue"
          { type: @discriminant, value: @member }.to_json()
        when "binaryTreeValue"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "singlyLinkedListValue"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "doublyLinkedListValue"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "nullValue"
          { type: @discriminant }.to_json()
        else
          { type: @discriminant, value: @member }.to_json()
        end
        @member.to_json()
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
          MapValue.validate_raw(obj: obj)
        when "listValue"
          obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "binaryTreeValue"
          BinaryTreeValue.validate_raw(obj: obj)
        when "singlyLinkedListValue"
          SinglyLinkedListValue.validate_raw(obj: obj)
        when "doublyLinkedListValue"
          DoublyLinkedListValue.validate_raw(obj: obj)
        when "nullValue"
          # noop
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end
      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object] 
      # @return [] 
      def is_a(obj)
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