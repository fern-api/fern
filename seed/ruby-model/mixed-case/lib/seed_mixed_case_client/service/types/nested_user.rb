# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedMixedCaseClient
  class Service
    class NestedUser
      # @return [String]
      attr_reader :name
      # @return [SeedMixedCaseClient::Service::User]
      attr_reader :nested_user
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param nested_user [SeedMixedCaseClient::Service::User]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedMixedCaseClient::Service::NestedUser]
      def initialize(name:, nested_user:, additional_properties: nil)
        @name = name
        @nested_user = nested_user
        @additional_properties = additional_properties
        @_field_set = { "Name": name, "NestedUser": nested_user }
      end

      # Deserialize a JSON object to an instance of NestedUser
      #
      # @param json_object [String]
      # @return [SeedMixedCaseClient::Service::NestedUser]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["Name"]
        if parsed_json["NestedUser"].nil?
          nested_user = nil
        else
          nested_user = parsed_json["NestedUser"].to_json
          nested_user = SeedMixedCaseClient::Service::User.from_json(json_object: nested_user)
        end
        new(
          name: name,
          nested_user: nested_user,
          additional_properties: struct
        )
      end

      # Serialize an instance of NestedUser to a JSON object
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
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        SeedMixedCaseClient::Service::User.validate_raw(obj: obj.nested_user)
      end
    end
  end
end
