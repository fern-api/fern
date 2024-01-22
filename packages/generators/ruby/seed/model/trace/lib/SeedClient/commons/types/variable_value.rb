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
        when "integer_value"
          member = json_object.value
        when "boolean_value"
          member = json_object.value
        when "double_value"
          member = json_object.value
        when "string_value"
          member = json_object.value
        when "char_value"
          member = json_object.value
        when "map_value"
          member = Commons::MapValue.from_json(json_object: json_object)
        when "list_value"
          member = json_object.value.map() do | v |
  Commons::VariableValue.from_json(json_object: v)
end
        when "binary_tree_value"
          member = Commons::BinaryTreeValue.from_json(json_object: json_object)
        when "singly_linked_list_value"
          member = Commons::SinglyLinkedListValue.from_json(json_object: json_object)
        when "doubly_linked_list_value"
          member = Commons::DoublyLinkedListValue.from_json(json_object: json_object)
        when "null_value"
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
        when "integer_value"
          { type: @discriminant, value: @member }.to_json()
        when "boolean_value"
          { type: @discriminant, value: @member }.to_json()
        when "double_value"
          { type: @discriminant, value: @member }.to_json()
        when "string_value"
          { type: @discriminant, value: @member }.to_json()
        when "char_value"
          { type: @discriminant, value: @member }.to_json()
        when "map_value"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "list_value"
          { type: @discriminant, value: @member }.to_json()
        when "binary_tree_value"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "singly_linked_list_value"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "doubly_linked_list_value"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "null_value"
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
        when "integer_value"
          obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "boolean_value"
          obj.is_a?(Boolean) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "double_value"
          obj.is_a?(Float) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "string_value"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "char_value"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "map_value"
          MapValue.validate_raw(obj: obj)
        when "list_value"
          obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "binary_tree_value"
          BinaryTreeValue.validate_raw(obj: obj)
        when "singly_linked_list_value"
          SinglyLinkedListValue.validate_raw(obj: obj)
        when "doubly_linked_list_value"
          DoublyLinkedListValue.validate_raw(obj: obj)
        when "null_value"
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
        new(member: member, discriminant: "integer_value")
      end
      # @param member [Boolean] 
      # @return [Commons::VariableValue] 
      def self.boolean_value(member:)
        new(member: member, discriminant: "boolean_value")
      end
      # @param member [Float] 
      # @return [Commons::VariableValue] 
      def self.double_value(member:)
        new(member: member, discriminant: "double_value")
      end
      # @param member [String] 
      # @return [Commons::VariableValue] 
      def self.string_value(member:)
        new(member: member, discriminant: "string_value")
      end
      # @param member [String] 
      # @return [Commons::VariableValue] 
      def self.char_value(member:)
        new(member: member, discriminant: "char_value")
      end
      # @param member [Commons::MapValue] 
      # @return [Commons::VariableValue] 
      def self.map_value(member:)
        new(member: member, discriminant: "map_value")
      end
      # @param member [Array<Commons::VariableValue>] 
      # @return [Commons::VariableValue] 
      def self.list_value(member:)
        new(member: member, discriminant: "list_value")
      end
      # @param member [Commons::BinaryTreeValue] 
      # @return [Commons::VariableValue] 
      def self.binary_tree_value(member:)
        new(member: member, discriminant: "binary_tree_value")
      end
      # @param member [Commons::SinglyLinkedListValue] 
      # @return [Commons::VariableValue] 
      def self.singly_linked_list_value(member:)
        new(member: member, discriminant: "singly_linked_list_value")
      end
      # @param member [Commons::DoublyLinkedListValue] 
      # @return [Commons::VariableValue] 
      def self.doubly_linked_list_value(member:)
        new(member: member, discriminant: "doubly_linked_list_value")
      end
      # @return [Commons::VariableValue] 
      def self.null_value
        new(member: nil, discriminant: "null_value")
      end
    end
  end
end