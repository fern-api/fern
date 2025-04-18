# frozen_string_literal: true

require_relative "metadata"
require_relative "email"
require_relative "weird_number"
require "ostruct"
require "json"

module SeedNullableClient
  class Nullable
    class User
      # @return [String]
      attr_reader :name
      # @return [String]
      attr_reader :id
      # @return [Array<String>]
      attr_reader :tags
      # @return [SeedNullableClient::Nullable::Metadata]
      attr_reader :metadata
      # @return [SeedNullableClient::Nullable::EMAIL]
      attr_reader :email
      # @return [SeedNullableClient::Nullable::WeirdNumber]
      attr_reader :favorite_number
      # @return [Array<Integer>]
      attr_reader :numbers
      # @return [Hash{String => Object}]
      attr_reader :strings
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param id [String]
      # @param tags [Array<String>]
      # @param metadata [SeedNullableClient::Nullable::Metadata]
      # @param email [SeedNullableClient::Nullable::EMAIL]
      # @param favorite_number [SeedNullableClient::Nullable::WeirdNumber]
      # @param numbers [Array<Integer>]
      # @param strings [Hash{String => Object}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableClient::Nullable::User]
      def initialize(name:, id:, email:, favorite_number:, tags: OMIT, metadata: OMIT, numbers: OMIT, strings: OMIT,
                     additional_properties: nil)
        @name = name
        @id = id
        @tags = tags if tags != OMIT
        @metadata = metadata if metadata != OMIT
        @email = email
        @favorite_number = favorite_number
        @numbers = numbers if numbers != OMIT
        @strings = strings if strings != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "name": name,
          "id": id,
          "tags": tags,
          "metadata": metadata,
          "email": email,
          "favorite-number": favorite_number,
          "numbers": numbers,
          "strings": strings
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of User
      #
      # @param json_object [String]
      # @return [SeedNullableClient::Nullable::User]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        id = parsed_json["id"]
        tags = parsed_json["tags"]
        if parsed_json["metadata"].nil?
          metadata = nil
        else
          metadata = parsed_json["metadata"].to_json
          metadata = SeedNullableClient::Nullable::Metadata.from_json(json_object: metadata)
        end
        email = parsed_json["email"]
        if parsed_json["favorite-number"].nil?
          favorite_number = nil
        else
          favorite_number = parsed_json["favorite-number"].to_json
          favorite_number = SeedNullableClient::Nullable::WeirdNumber.from_json(json_object: favorite_number)
        end
        numbers = parsed_json["numbers"]
        strings = parsed_json["strings"]
        new(
          name: name,
          id: id,
          tags: tags,
          metadata: metadata,
          email: email,
          favorite_number: favorite_number,
          numbers: numbers,
          strings: strings,
          additional_properties: struct
        )
      end

      # Serialize an instance of User to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.tags&.is_a?(Array) != false || raise("Passed value for field obj.tags is not the expected type, validation failed.")
        obj.metadata.nil? || SeedNullableClient::Nullable::Metadata.validate_raw(obj: obj.metadata)
        obj.email.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
        SeedNullableClient::Nullable::WeirdNumber.validate_raw(obj: obj.favorite_number)
        obj.numbers&.is_a?(Array) != false || raise("Passed value for field obj.numbers is not the expected type, validation failed.")
        obj.strings&.is_a?(Hash) != false || raise("Passed value for field obj.strings is not the expected type, validation failed.")
      end
    end
  end
end
