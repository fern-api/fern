# frozen_string_literal: true

require "ostruct"
require "json"

module SeedRequestParametersClient
  class User
    class CreateUsernameBody
      # @return [String]
      attr_reader :username
      # @return [String]
      attr_reader :password
      # @return [String]
      attr_reader :name
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param username [String]
      # @param password [String]
      # @param name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedRequestParametersClient::User::CreateUsernameBody]
      def initialize(username:, password:, name:, additional_properties: nil)
        @username = username
        @password = password
        @name = name
        @additional_properties = additional_properties
        @_field_set = { "username": username, "password": password, "name": name }
      end

      # Deserialize a JSON object to an instance of CreateUsernameBody
      #
      # @param json_object [String]
      # @return [SeedRequestParametersClient::User::CreateUsernameBody]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        username = parsed_json["username"]
        password = parsed_json["password"]
        name = parsed_json["name"]
        new(
          username: username,
          password: password,
          name: name,
          additional_properties: struct
        )
      end

      # Serialize an instance of CreateUsernameBody to a JSON object
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
        obj.username.is_a?(String) != false || raise("Passed value for field obj.username is not the expected type, validation failed.")
        obj.password.is_a?(String) != false || raise("Passed value for field obj.password is not the expected type, validation failed.")
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      end
    end
  end
end
