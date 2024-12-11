# frozen_string_literal: true

require "json"
require_relative "inline_type_1"
require_relative "inline_type_2"

module SeedObjectClient
  class InlinedUndiscriminatedUnion1
    # Deserialize a JSON object to an instance of InlinedUndiscriminatedUnion1
    #
    # @param json_object [String]
    # @return [SeedObjectClient::InlinedUndiscriminatedUnion1]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      begin
        SeedObjectClient::InlineType1.validate_raw(obj: struct)
        return SeedObjectClient::InlineType1.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedObjectClient::InlineType2.validate_raw(obj: struct)
        return SeedObjectClient::InlineType2.from_json(json_object: struct) unless struct.nil?

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
        return SeedObjectClient::InlineType1.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedObjectClient::InlineType2.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      raise("Passed value matched no type within the union, validation failed.")
    end
  end
end
