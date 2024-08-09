# frozen_string_literal: true

require "json"
require_relative "account"
require_relative "patient"
require_relative "practitioner"
require_relative "script"

module SeedApiClient
  class ResourceList
    # Deserialize a JSON object to an instance of ResourceList
    #
    # @param json_object [String]
    # @return [SeedApiClient::ResourceList]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      begin
        SeedApiClient::Account.validate_raw(obj: struct)
        return SeedApiClient::Account.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedApiClient::Patient.validate_raw(obj: struct)
        return SeedApiClient::Patient.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedApiClient::Practitioner.validate_raw(obj: struct)
        return SeedApiClient::Practitioner.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedApiClient::Script.validate_raw(obj: struct)
        return SeedApiClient::Script.from_json(json_object: struct) unless struct.nil?

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
        return SeedApiClient::Account.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedApiClient::Patient.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedApiClient::Practitioner.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedApiClient::Script.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      raise("Passed value matched no type within the union, validation failed.")
    end
  end
end
