# frozen_string_literal: true

require "json"
require_relative "user"
require_relative "admin"

module SeedPropertyAccessClient
  # Example of an undiscriminated union
  class UserOrAdmin
    # Deserialize a JSON object to an instance of UserOrAdmin
    #
    # @param json_object [String]
    # @return [SeedPropertyAccessClient::UserOrAdmin]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      begin
        SeedPropertyAccessClient::User.validate_raw(obj: struct)
        return SeedPropertyAccessClient::User.from_json(json_object: struct) unless struct.nil?

        return nil
      rescue StandardError
        # noop
      end
      begin
        SeedPropertyAccessClient::Admin.validate_raw(obj: struct)
        return SeedPropertyAccessClient::Admin.from_json(json_object: struct) unless struct.nil?

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
        return SeedPropertyAccessClient::User.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      begin
        return SeedPropertyAccessClient::Admin.validate_raw(obj: obj)
      rescue StandardError
        # noop
      end
      raise("Passed value matched no type within the union, validation failed.")
    end
  end
end
