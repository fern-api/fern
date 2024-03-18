# frozen_string_literal: true

require_relative "user"
require "json"

module SeedQueryParametersClient
  class User
    class NestedUser
      attr_reader :name, :user, :additional_properties

      # @param name [String]
      # @param user [User::User]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [User::NestedUser]
      def initialize(name:, user:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [User::User]
        @user = user
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of NestedUser
      #
      # @param json_object [JSON]
      # @return [User::NestedUser]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = struct.name
        if parsed_json["user"].nil?
          user = nil
        else
          user = parsed_json["user"].to_json
          user = User::User.from_json(json_object: user)
        end
        new(name: name, user: user, additional_properties: struct)
      end

      # Serialize an instance of NestedUser to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "user": @user }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        User::User.validate_raw(obj: obj.user)
      end
    end
  end
end
