# frozen_string_literal: true

require_relative "user_optional_list_container"
require "ostruct"
require "json"

module SeedPaginationClient
  class Users
    class UserOptionalListPage
      # @return [SeedPaginationClient::Users::UserOptionalListContainer]
      attr_reader :data
      # @return [String]
      attr_reader :next_
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param data [SeedPaginationClient::Users::UserOptionalListContainer]
      # @param next_ [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Users::UserOptionalListPage]
      def initialize(data:, next_: OMIT, additional_properties: nil)
        @data = data
        @next_ = next_ if next_ != OMIT
        @additional_properties = additional_properties
        @_field_set = { "data": data, "next": next_ }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of UserOptionalListPage
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Users::UserOptionalListPage]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["data"].nil?
          data = nil
        else
          data = parsed_json["data"].to_json
          data = SeedPaginationClient::Users::UserOptionalListContainer.from_json(json_object: data)
        end
        next_ = parsed_json["next"]
        new(
          data: data,
          next_: next_,
          additional_properties: struct
        )
      end

      # Serialize an instance of UserOptionalListPage to a JSON object
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
        SeedPaginationClient::Users::UserOptionalListContainer.validate_raw(obj: obj.data)
        obj.next_&.is_a?(String) != false || raise("Passed value for field obj.next_ is not the expected type, validation failed.")
      end
    end
  end
end
