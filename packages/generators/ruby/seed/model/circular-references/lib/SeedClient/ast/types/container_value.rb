# frozen_string_literal: true
require "json"
require "ast/types/FieldValue"
require "ast/types/FieldValue"

module SeedClient
  module Ast
    class ContainerValue
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Ast::ContainerValue] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of ContainerValue
      #
      # @param json_object [JSON] 
      # @return [Ast::ContainerValue] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "list"
          member = json_object.value.map() do | v |
  Ast::FieldValue.from_json(json_object: v)
end
        when "optional"
          member = Ast::FieldValue.from_json(json_object: json_object.value)
        else
          member = json_object.map() do | v |
  Ast::FieldValue.from_json(json_object: v)
end
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "list"
          { type: @discriminant, value: @member }.to_json()
        when "optional"
          { type: @discriminant, value: @member }.to_json()
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
        when "list"
          obj.is_a?(Array) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "optional"
          FieldValue.validate_raw(obj: obj)
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
      # @param member [Array<Ast::FieldValue>] 
      # @return [Ast::ContainerValue] 
      def self.list(member:)
        new(member: member, discriminant: "list")
      end
      # @param member [Ast::FieldValue] 
      # @return [Ast::ContainerValue] 
      def self.optional(member:)
        new(member: member, discriminant: "optional")
      end
    end
  end
end