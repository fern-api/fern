# frozen_string_literal: true

require "json"
require_relative "foo"
require_relative "foo_extended"

module SeedUnionsClient
  class Types
    class UnionWithSubTypes
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedUnionsClient::Types::UnionWithSubTypes]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of UnionWithSubTypes
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Types::UnionWithSubTypes]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "foo"
                   SeedUnionsClient::Types::Foo.from_json(json_object: json_object)
                 when "fooExtended"
                   SeedUnionsClient::Types::FooExtended.from_json(json_object: json_object)
                 else
                   SeedUnionsClient::Types::Foo.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "foo"
          { **@member.to_json, type: @discriminant }.to_json
        when "fooExtended"
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
        when "foo"
          SeedUnionsClient::Types::Foo.validate_raw(obj: obj)
        when "fooExtended"
          SeedUnionsClient::Types::FooExtended.validate_raw(obj: obj)
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
      # @return [SeedUnionsClient::Types::UnionWithSubTypes]
      def self.foo(member:)
        new(member: member, discriminant: "foo")
      end

      # @param member [SeedUnionsClient::Types::FooExtended]
      # @return [SeedUnionsClient::Types::UnionWithSubTypes]
      def self.foo_extended(member:)
        new(member: member, discriminant: "fooExtended")
      end
    end
  end
end
