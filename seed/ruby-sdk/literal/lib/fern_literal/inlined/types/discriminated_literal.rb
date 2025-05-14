# frozen_string_literal: true

require "json"

module SeedLiteralClient
  class Inlined
    class DiscriminatedLiteral
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedLiteralClient::Inlined::DiscriminatedLiteral]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of DiscriminatedLiteral
      #
      # @param json_object [String]
      # @return [SeedLiteralClient::Inlined::DiscriminatedLiteral]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "customName"
                   json_object.value
                 when "defaultName"
                   json_object.value
                 when "george"
                   json_object.value
                 when "literalGeorge"
                   json_object.value
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
        when "customName"
        when "defaultName"
        when "george"
        when "literalGeorge"
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
        when "customName"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "defaultName"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "george"
          obj.is_a?(Boolean) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "literalGeorge"
          obj.is_a?(Boolean) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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

      # @param member [String]
      # @return [SeedLiteralClient::Inlined::DiscriminatedLiteral]
      def self.custom_name(member:)
        new(member: member, discriminant: "customName")
      end

      # @param member [String]
      # @return [SeedLiteralClient::Inlined::DiscriminatedLiteral]
      def self.default_name(member:)
        new(member: member, discriminant: "defaultName")
      end

      # @param member [Boolean]
      # @return [SeedLiteralClient::Inlined::DiscriminatedLiteral]
      def self.george(member:)
        new(member: member, discriminant: "george")
      end

      # @param member [Boolean]
      # @return [SeedLiteralClient::Inlined::DiscriminatedLiteral]
      def self.literal_george(member:)
        new(member: member, discriminant: "literalGeorge")
      end
    end
  end
end
