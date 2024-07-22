# frozen_string_literal: true

require "ostruct"
require "json"

module SeedMixedCaseClient
  class Service
    class User
      # @return [String]
      attr_reader :user_name
      # @return [Array<String>]
      attr_reader :metadata_tags
      # @return [Hash{String => String}]
      attr_reader :extra_properties
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param user_name [String]
      # @param metadata_tags [Array<String>]
      # @param extra_properties [Hash{String => String}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedMixedCaseClient::Service::User]
      def initialize(user_name:, metadata_tags:, extra_properties:, additional_properties: nil)
        @user_name = user_name
        @metadata_tags = metadata_tags
        @extra_properties = extra_properties
        @additional_properties = additional_properties
        @_field_set = { "userName": user_name, "metadata_tags": metadata_tags, "EXTRA_PROPERTIES": extra_properties }
      end

      # Deserialize a JSON object to an instance of User
      #
      # @param json_object [String]
      # @return [SeedMixedCaseClient::Service::User]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        user_name = parsed_json["userName"]
        metadata_tags = parsed_json["metadata_tags"]
        extra_properties = parsed_json["EXTRA_PROPERTIES"]
        new(
          user_name: user_name,
          metadata_tags: metadata_tags,
          extra_properties: extra_properties,
          additional_properties: struct
        )
      end

      # Serialize an instance of User to a JSON object
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
        obj.user_name.is_a?(String) != false || raise("Passed value for field obj.user_name is not the expected type, validation failed.")
        obj.metadata_tags.is_a?(Array) != false || raise("Passed value for field obj.metadata_tags is not the expected type, validation failed.")
        obj.extra_properties.is_a?(Hash) != false || raise("Passed value for field obj.extra_properties is not the expected type, validation failed.")
      end
    end
  end
end
