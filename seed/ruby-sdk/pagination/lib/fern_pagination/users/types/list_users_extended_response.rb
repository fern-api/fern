# frozen_string_literal: true

require_relative "user_list_container"
require "json"

module SeedPaginationClient
  class Users
    class ListUsersExtendedResponse
      attr_reader :total_count, :data, :next_, :additional_properties

      # @param total_count [Integer] The totall number of /users
      # @param data [Users::UserListContainer]
      # @param next_ [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Users::ListUsersExtendedResponse]
      def initialize(total_count:, data:, next_: nil, additional_properties: nil)
        # @type [Integer] The totall number of /users
        @total_count = total_count
        # @type [Users::UserListContainer]
        @data = data
        # @type [String]
        @next_ = next_
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ListUsersExtendedResponse
      #
      # @param json_object [JSON]
      # @return [Users::ListUsersExtendedResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        total_count = struct.total_count
        if parsed_json["data"].nil?
          data = nil
        else
          data = parsed_json["data"].to_json
          data = Users::UserListContainer.from_json(json_object: data)
        end
        next_ = struct.next
        new(total_count: total_count, data: data, next_: next_, additional_properties: struct)
      end

      # Serialize an instance of ListUsersExtendedResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "total_count": @total_count, "data": @data, "next": @next_ }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.total_count.is_a?(Integer) != false || raise("Passed value for field obj.total_count is not the expected type, validation failed.")
        Users::UserListContainer.validate_raw(obj: obj.data)
        obj.next_&.is_a?(String) != false || raise("Passed value for field obj.next_ is not the expected type, validation failed.")
      end
    end
  end
end
