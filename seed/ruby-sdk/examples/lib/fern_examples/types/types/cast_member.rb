# frozen_string_literal: true

require "json"
require_relative "actor"
require_relative "actress"
require_relative "stunt_double"

module SeedExamplesClient
  class Types
    class CastMember
      # Deserialize a JSON object to an instance of CastMember
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::CastMember]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          SeedExamplesClient::Types::Actor.validate_raw(obj: struct)
          return SeedExamplesClient::Types::Actor.from_json(json_object: struct) unless struct.nil?

          return nil
        rescue StandardError
          # noop
        end
        begin
          SeedExamplesClient::Types::Actress.validate_raw(obj: struct)
          return SeedExamplesClient::Types::Actress.from_json(json_object: struct) unless struct.nil?

          return nil
        rescue StandardError
          # noop
        end
        begin
          SeedExamplesClient::Types::StuntDouble.validate_raw(obj: struct)
          return SeedExamplesClient::Types::StuntDouble.from_json(json_object: struct) unless struct.nil?

          return nil
        rescue StandardError
          # noop
        end
        struct
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        begin
          return SeedExamplesClient::Types::Actor.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return SeedExamplesClient::Types::Actress.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return SeedExamplesClient::Types::StuntDouble.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
