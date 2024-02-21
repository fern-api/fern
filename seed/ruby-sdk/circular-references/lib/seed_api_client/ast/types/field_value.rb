# frozen_string_literal: true

require "json"
require_relative "object_value"
require_relative "container_value"
require_relative "primitive_value"

module SeedApiClient
  class Ast
    class FieldValue
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Ast::FieldValue]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of FieldValue
      #
      # @param json_object [JSON]
      # @return [Ast::FieldValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "primitive_value"
                   json_object.value
                 when "object_value"
                   Ast::ObjectValue.from_json(json_object: json_object)
                 when "container_value"
                   Ast::ContainerValue.from_json(json_object: json_object.value)
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
        when "primitive_value"
          { "type": @discriminant, "value": @member }.to_json
        when "object_value"
          { **@member.to_json, type: @discriminant }.to_json
        when "container_value"
          { "type": @discriminant, "value": @member }.to_json
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
        when "primitive_value"
          obj.is_a?(Ast::PrimitiveValue) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "object_value"
          Ast::ObjectValue.validate_raw(obj: obj)
        when "container_value"
          Ast::ContainerValue.validate_raw(obj: obj)
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

      # @param member [Ast::PrimitiveValue]
      # @return [Ast::FieldValue]
      def self.primitive_value(member:)
        new(member: member, discriminant: "primitive_value")
      end

      # @param member [Ast::ObjectValue]
      # @return [Ast::FieldValue]
      def self.object_value(member:)
        new(member: member, discriminant: "object_value")
      end

      # @param member [Ast::ContainerValue]
      # @return [Ast::FieldValue]
      def self.container_value(member:)
        new(member: member, discriminant: "container_value")
      end
    end
  end
end
