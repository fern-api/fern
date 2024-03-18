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
      # @param json_object [JSON]
      # @return [Types::CastMember]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          Types::Actor.validate_raw(obj: struct)
          return Types::Actor.from_json(json_object: json_object)
        rescue StandardError
          # noop
        end
        begin
          Types::Actress.validate_raw(obj: struct)
          return Types::Actress.from_json(json_object: json_object)
        rescue StandardError
          # noop
        end
        begin
          Types::StuntDouble.validate_raw(obj: struct)
          return Types::StuntDouble.from_json(json_object: json_object)
        rescue StandardError
          # noop
        end
        struct
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        begin
          return Types::Actor.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return Types::Actress.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return Types::StuntDouble.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
