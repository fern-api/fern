# frozen_string_literal: true

require "json"
require_relative "foo"

module SeedUnionsClient
  class Types
    class UnionWithDuplicateTypes
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedUnionsClient::Types::UnionWithDuplicateTypes]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of UnionWithDuplicateTypes
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Types::UnionWithDuplicateTypes]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "foo1"
        when "foo2"
        end
        member = SeedUnionsClient::Types::Foo.from_json(json_object: json_object)
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "foo1"
          { **@member.to_json, type: @discriminant }.to_json
        when "foo2"
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
        when "foo1"
          SeedUnionsClient::Types::Foo.validate_raw(obj: obj)
        when "foo2"
          SeedUnionsClient::Types::Foo.validate_raw(obj: obj)
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

      # @param member [SeedUnionsClient::Types::Foo]
      # @return [SeedUnionsClient::Types::UnionWithDuplicateTypes]
      def self.foo_1(member:)
        new(member: member, discriminant: "foo1")
      end

      # @param member [SeedUnionsClient::Types::Foo]
      # @return [SeedUnionsClient::Types::UnionWithDuplicateTypes]
      def self.foo_2(member:)
        new(member: member, discriminant: "foo2")
      end
    end
  end
end
