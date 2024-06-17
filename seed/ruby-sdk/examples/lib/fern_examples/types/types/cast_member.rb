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
      # @return [CastMember]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          Actor.validate_raw(obj: struct)
          return Actor.from_json(json_object: json_object) unless json_object.nil?

          return nil
        rescue StandardError
          # noop
        end
        begin
          Actress.validate_raw(obj: struct)
          return Actress.from_json(json_object: json_object) unless json_object.nil?

          return nil
        rescue StandardError
          # noop
        end
        begin
          StuntDouble.validate_raw(obj: struct)
          return StuntDouble.from_json(json_object: json_object) unless json_object.nil?

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
          return Actor.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return Actress.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return StuntDouble.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end
    end
  end
end
