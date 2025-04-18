# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedPaginationClient
  class Users
    class ListUsersMixedTypePaginationResponse
      # @return [String]
      attr_reader :next_
      # @return [Array<SeedPaginationClient::Users::User>]
      attr_reader :data
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param next_ [String]
      # @param data [Array<SeedPaginationClient::Users::User>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Users::ListUsersMixedTypePaginationResponse]
      def initialize(next_:, data:, additional_properties: nil)
        @next_ = next_
        @data = data
        @additional_properties = additional_properties
        @_field_set = { "next": next_, "data": data }
      end

      # Deserialize a JSON object to an instance of ListUsersMixedTypePaginationResponse
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Users::ListUsersMixedTypePaginationResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        next_ = parsed_json["next"]
        data = parsed_json["data"]&.map do |item|
          item = item.to_json
          SeedPaginationClient::Users::User.from_json(json_object: item)
        end
        new(
          next_: next_,
          data: data,
          additional_properties: struct
        )
      end

      # Serialize an instance of ListUsersMixedTypePaginationResponse to a JSON object
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
        obj.next_.is_a?(String) != false || raise("Passed value for field obj.next_ is not the expected type, validation failed.")
        obj.data.is_a?(Array) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
      end
    end
  end
end
