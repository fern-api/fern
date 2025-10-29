# frozen_string_literal: true

require "json"
require_relative "variant_a"
require_relative "variant_b"
require_relative "variant_c"

module SeedUndiscriminatedUnionWithResponsePropertyClient
  # Undiscriminated union with multiple object variants.
  #  This reproduces the Pipedream issue where Emitter is a union of
  #  DeployedComponent, HttpInterface, and TimerInterface.
  class MyUnion
    # Deserialize a JSON object to an instance of MyUnion
    #
    # @param json_object [String]
    # @return [SeedUndiscriminatedUnionWithResponsePropertyClient::MyUnion]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      begin
        SeedUndiscriminatedUnionWithResponsePropertyClient::VariantA.validate_raw(obj: struct)
        unless struct.nil?
          return SeedUndiscriminatedUnionWithResponsePropertyClient::VariantA.from_json(json_object: struct)
        end

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedUndiscriminatedUnionWithResponsePropertyClient::VariantB.validate_raw(obj: struct)
        unless struct.nil?
          return SeedUndiscriminatedUnionWithResponsePropertyClient::VariantB.from_json(json_object: struct)
        end

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedUndiscriminatedUnionWithResponsePropertyClient::VariantC.validate_raw(obj: struct)
        unless struct.nil?
          return SeedUndiscriminatedUnionWithResponsePropertyClient::VariantC.from_json(json_object: struct)
        end

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
        return SeedUndiscriminatedUnionWithResponsePropertyClient::VariantA.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedUndiscriminatedUnionWithResponsePropertyClient::VariantB.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedUndiscriminatedUnionWithResponsePropertyClient::VariantC.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      raise("Passed value matched no type within the union, validation failed.")
    end
  end
end
