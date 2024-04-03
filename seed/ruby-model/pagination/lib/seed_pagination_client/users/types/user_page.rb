# frozen_string_literal: true

require_relative "user_list_container"
require "json"

module SeedPaginationClient
  class Users
    class UserPage
      attr_reader :data, :next_, :additional_properties

      # @param data [Users::UserListContainer]
      # @param next_ [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Users::UserPage]
      def initialize(data:, next_: nil, additional_properties: nil)
        # @type [Users::UserListContainer]
        @data = data
        # @type [String]
        @next_ = next_
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of UserPage
      #
      # @param json_object [JSON]
      # @return [Users::UserPage]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["data"].nil?
          data = nil
        else
          data = parsed_json["data"].to_json
          data = Users::UserListContainer.from_json(json_object: data)
        end
        next_ = struct.next
        new(data: data, next_: next_, additional_properties: struct)
      end

      # Serialize an instance of UserPage to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "data": @data, "next": @next_ }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Users::UserListContainer.validate_raw(obj: obj.data)
        obj.next_&.is_a?(String) != false || raise("Passed value for field obj.next_ is not the expected type, validation failed.")
      end
    end
  end
end
