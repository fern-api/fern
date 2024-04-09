# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedPaginationClient
  class Users
    class UserListContainer
      attr_reader :users, :additional_properties, :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param users [Array<SeedPaginationClient::Users::User>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Users::UserListContainer]
      def initialize(users:, additional_properties: nil)
        # @type [Array<SeedPaginationClient::Users::User>]
        @users = users
        @_field_set = { "users": @users }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of UserListContainer
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Users::UserListContainer]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        users = parsed_json["users"]&.map do |v|
          v = v.to_json
          SeedPaginationClient::Users::User.from_json(json_object: v)
        end
        new(users: users, additional_properties: struct)
      end

      # Serialize an instance of UserListContainer to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.users.is_a?(Array) != false || raise("Passed value for field obj.users is not the expected type, validation failed.")
      end
    end
  end
end
