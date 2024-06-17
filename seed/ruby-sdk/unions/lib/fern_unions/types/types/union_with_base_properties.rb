# frozen_string_literal: true

require "json"
require_relative "foo"

module SeedUnionsClient
  class Types
    class UnionWithBaseProperties
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant
      # @return [String]
      attr_reader :id

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @param id [String]
      # @return [SeedUnionsClient::Types::UnionWithBaseProperties]
      def initialize(member:, discriminant:, id:)
        @member = member
        @discriminant = discriminant
        @id = id
      end

      # Deserialize a JSON object to an instance of UnionWithBaseProperties
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Types::UnionWithBaseProperties]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "integer"
                   json_object.value
                 when "string"
                   json_object.value
                 when "foo"
                   SeedUnionsClient::Types::Foo.from_json(json_object: json_object)
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
        when "integer"
          { "type": @discriminant, "value": @member }.to_json
        when "string"
          { "type": @discriminant, "value": @member }.to_json
        when "foo"
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
        when "integer"
          obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "string"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "foo"
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

      # @param member [Integer]
      # @return [SeedUnionsClient::Types::UnionWithBaseProperties]
      def self.integer(member:)
        new(member: member, discriminant: "integer")
      end

      # @param member [String]
      # @return [SeedUnionsClient::Types::UnionWithBaseProperties]
      def self.string(member:)
        new(member: member, discriminant: "string")
      end

      # @param member [SeedUnionsClient::Types::Foo]
      # @return [SeedUnionsClient::Types::UnionWithBaseProperties]
      def self.foo(member:)
        new(member: member, discriminant: "foo")
      end
    end
  end
end
