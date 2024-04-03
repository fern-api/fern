# frozen_string_literal: true

require "json"

module SeedMixedCaseClient
  class Service
    class User
      attr_reader :user_name, :metadata_tags, :extra_properties, :additional_properties

      # @param user_name [String]
      # @param metadata_tags [Array<String>]
      # @param extra_properties [Hash{String => String}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::User]
      def initialize(user_name:, metadata_tags:, extra_properties:, additional_properties: nil)
        # @type [String]
        @user_name = user_name
        # @type [Array<String>]
        @metadata_tags = metadata_tags
        # @type [Hash{String => String}]
        @extra_properties = extra_properties
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of User
      #
      # @param json_object [JSON]
      # @return [Service::User]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        user_name = struct.userName
        metadata_tags = struct.metadata_tags
        extra_properties = struct.EXTRA_PROPERTIES
        new(user_name: user_name, metadata_tags: metadata_tags, extra_properties: extra_properties,
            additional_properties: struct)
      end

      # Serialize an instance of User to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "userName": @user_name, "metadata_tags": @metadata_tags, "EXTRA_PROPERTIES": @extra_properties }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
