# frozen_string_literal: true

require "json"
require_relative "field_value"

module SeedApiClient
  class Ast
    class ContainerValue
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [ContainerValue]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of ContainerValue
      #
      # @param json_object [String]
      # @return [ContainerValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "list"
                   json_object.value&.map do |v|
                     v = v.to_json
                     FieldValue.from_json(json_object: v)
                   end
                 when "optional"
                   FieldValue.from_json(json_object: json_object.value)
                 else
                   json_object&.map do |v|
                     v = v.to_json
                     FieldValue.from_json(json_object: v)
                   end
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "list"
        when "optional"
        end
        { "type": @discriminant, "value": @member }.to_json
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
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [Array<FieldValue>]
      # @return [ContainerValue]
      def self.list(member:)
        new(member: member, discriminant: "list")
      end

      # @param member [FieldValue]
      # @return [ContainerValue]
      def self.optional(member:)
        new(member: member, discriminant: "optional")
      end
    end
  end
end
