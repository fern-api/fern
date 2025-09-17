# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedPaginationClient
  module InlineUsers
    class InlineUsers
      class UserOptionalListContainer
        # @return [Array<SeedPaginationClient::InlineUsers::InlineUsers::User>]
        attr_reader :users
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param users [Array<SeedPaginationClient::InlineUsers::InlineUsers::User>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedPaginationClient::InlineUsers::InlineUsers::UserOptionalListContainer]
        def initialize(users: OMIT, additional_properties: nil)
          @users = users if users != OMIT
          @additional_properties = additional_properties
          @_field_set = { "users": users }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of UserOptionalListContainer
        #
        # @param json_object [String]
        # @return [SeedPaginationClient::InlineUsers::InlineUsers::UserOptionalListContainer]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          users = parsed_json["users"]&.map do |item|
            item = item.to_json
            SeedPaginationClient::InlineUsers::InlineUsers::User.from_json(json_object: item)
          end
          new(users: users, additional_properties: struct)
        end

        # Serialize an instance of UserOptionalListContainer to a JSON object
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
          obj.users&.is_a?(Array) != false || raise("Passed value for field obj.users is not the expected type, validation failed.")
        end
      end
    end
  end
end
