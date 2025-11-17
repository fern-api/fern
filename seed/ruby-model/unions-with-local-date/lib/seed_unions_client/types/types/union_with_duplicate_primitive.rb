# frozen_string_literal: true

require "json"

module SeedUnionsClient
  class Types
    class UnionWithDuplicatePrimitive
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedUnionsClient::Types::UnionWithDuplicatePrimitive]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of UnionWithDuplicatePrimitive
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Types::UnionWithDuplicatePrimitive]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "integer1"
                   json_object.value
                 when "integer2"
                   json_object.value
                 when "string1"
                   json_object.value
                 when "string2"
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
        when "integer1"
        when "integer2"
        when "string1"
        when "string2"
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
        when "integer1"
          obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "integer2"
          obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "string1"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "string2"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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
      # @return [SeedUnionsClient::Types::UnionWithDuplicatePrimitive]
      def self.integer_1(member:)
        new(member: member, discriminant: "integer1")
      end

      # @param member [Integer]
      # @return [SeedUnionsClient::Types::UnionWithDuplicatePrimitive]
      def self.integer_2(member:)
        new(member: member, discriminant: "integer2")
      end

      # @param member [String]
      # @return [SeedUnionsClient::Types::UnionWithDuplicatePrimitive]
      def self.string_1(member:)
        new(member: member, discriminant: "string1")
      end

      # @param member [String]
      # @return [SeedUnionsClient::Types::UnionWithDuplicatePrimitive]
      def self.string_2(member:)
        new(member: member, discriminant: "string2")
      end
    end
  end
end
