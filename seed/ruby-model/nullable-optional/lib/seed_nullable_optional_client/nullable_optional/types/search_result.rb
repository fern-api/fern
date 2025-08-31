# frozen_string_literal: true

require "json"
require_relative "user_response"
require_relative "organization"
require_relative "document"

module SeedNullableOptionalClient
  class NullableOptional
    # Undiscriminated union for testing
    class SearchResult
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of SearchResult
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "user"
                   SeedNullableOptionalClient::NullableOptional::UserResponse.from_json(json_object: json_object)
                 when "organization"
                   SeedNullableOptionalClient::NullableOptional::Organization.from_json(json_object: json_object)
                 when "document"
                   SeedNullableOptionalClient::NullableOptional::Document.from_json(json_object: json_object)
                 else
                   SeedNullableOptionalClient::NullableOptional::UserResponse.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "user"
          { **@member.to_json, type: @discriminant }.to_json
        when "organization"
          { **@member.to_json, type: @discriminant }.to_json
        when "document"
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
        when "user"
          SeedNullableOptionalClient::NullableOptional::UserResponse.validate_raw(obj: obj)
        when "organization"
          SeedNullableOptionalClient::NullableOptional::Organization.validate_raw(obj: obj)
        when "document"
          SeedNullableOptionalClient::NullableOptional::Document.validate_raw(obj: obj)
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

      # @param member [SeedNullableOptionalClient::NullableOptional::UserResponse]
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      def self.user(member:)
        new(member: member, discriminant: "user")
      end

      # @param member [SeedNullableOptionalClient::NullableOptional::Organization]
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      def self.organization(member:)
        new(member: member, discriminant: "organization")
      end

      # @param member [SeedNullableOptionalClient::NullableOptional::Document]
      # @return [SeedNullableOptionalClient::NullableOptional::SearchResult]
      def self.document(member:)
        new(member: member, discriminant: "document")
      end
    end
  end
end
