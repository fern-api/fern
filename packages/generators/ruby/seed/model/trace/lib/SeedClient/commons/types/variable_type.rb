# frozen_string_literal: true
require "json"
require "commons/types/ListType"
require "commons/types/MapType"

module SeedClient
  module Commons
    class VariableType
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Commons::VariableType] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of VariableType
      #
      # @param json_object [JSON] 
      # @return [Commons::VariableType] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "integer_type"
          member = nil
        when "double_type"
          member = nil
        when "boolean_type"
          member = nil
        when "string_type"
          member = nil
        when "char_type"
          member = nil
        when "list_type"
          member = Commons::ListType.from_json(json_object: json_object)
        when "map_type"
          member = Commons::MapType.from_json(json_object: json_object)
        when "binary_tree_type"
          member = nil
        when "singly_linked_list_type"
          member = nil
        when "doubly_linked_list_type"
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
        when "integer_type"
          { type: @discriminant }.to_json()
        when "double_type"
          { type: @discriminant }.to_json()
        when "boolean_type"
          { type: @discriminant }.to_json()
        when "string_type"
          { type: @discriminant }.to_json()
        when "char_type"
          { type: @discriminant }.to_json()
        when "list_type"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "map_type"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "binary_tree_type"
          { type: @discriminant }.to_json()
        when "singly_linked_list_type"
          { type: @discriminant }.to_json()
        when "doubly_linked_list_type"
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
        when "integer_type"
          # noop
        when "double_type"
          # noop
        when "boolean_type"
          # noop
        when "string_type"
          # noop
        when "char_type"
          # noop
        when "list_type"
          ListType.validate_raw(obj: obj)
        when "map_type"
          MapType.validate_raw(obj: obj)
        when "binary_tree_type"
          # noop
        when "singly_linked_list_type"
          # noop
        when "doubly_linked_list_type"
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
      # @return [Commons::VariableType] 
      def self.integer_type
        new(member: nil, discriminant: "integer_type")
      end
      # @return [Commons::VariableType] 
      def self.double_type
        new(member: nil, discriminant: "double_type")
      end
      # @return [Commons::VariableType] 
      def self.boolean_type
        new(member: nil, discriminant: "boolean_type")
      end
      # @return [Commons::VariableType] 
      def self.string_type
        new(member: nil, discriminant: "string_type")
      end
      # @return [Commons::VariableType] 
      def self.char_type
        new(member: nil, discriminant: "char_type")
      end
      # @param member [Commons::ListType] 
      # @return [Commons::VariableType] 
      def self.list_type(member:)
        new(member: member, discriminant: "list_type")
      end
      # @param member [Commons::MapType] 
      # @return [Commons::VariableType] 
      def self.map_type(member:)
        new(member: member, discriminant: "map_type")
      end
      # @return [Commons::VariableType] 
      def self.binary_tree_type
        new(member: nil, discriminant: "binary_tree_type")
      end
      # @return [Commons::VariableType] 
      def self.singly_linked_list_type
        new(member: nil, discriminant: "singly_linked_list_type")
      end
      # @return [Commons::VariableType] 
      def self.doubly_linked_list_type
        new(member: nil, discriminant: "doubly_linked_list_type")
      end
    end
  end
end