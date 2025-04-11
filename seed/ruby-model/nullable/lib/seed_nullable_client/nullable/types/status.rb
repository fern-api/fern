# frozen_string_literal: true

require "json"
require "date"

module SeedNullableClient
  class Nullable
    class Status
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedNullableClient::Nullable::Status]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of Status
      #
      # @param json_object [String]
      # @return [SeedNullableClient::Nullable::Status]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "active"
                   nil
                 when "archived"
                   DateTime.parse(json_object.value) unless json_object.value.nil?
                 when "soft-deleted"
                   DateTime.parse(json_object.value) unless json_object.value.nil?
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
        when "active"
          { type: @discriminant }.to_json
        when "archived"
          { "type": @discriminant, "value": @member }.to_json
        when "soft-deleted"
          { "type": @discriminant, "value": @member }.to_json
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
        when "active"
          # noop
        when "archived"
          obj.is_a?(DateTime) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "soft-deleted"
          obj.is_a?(DateTime) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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

      # @return [SeedNullableClient::Nullable::Status]
      def self.active
        new(member: nil, discriminant: "active")
      end

      # @param member [DateTime]
      # @return [SeedNullableClient::Nullable::Status]
      def self.archived(member:)
        new(member: member, discriminant: "archived")
      end

      # @param member [DateTime]
      # @return [SeedNullableClient::Nullable::Status]
      def self.soft_deleted(member:)
        new(member: member, discriminant: "soft-deleted")
      end
    end
  end
end
