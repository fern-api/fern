# frozen_string_literal: true

require "json"

module SeedQueryParametersClient
  class User
    class User
      attr_reader :name, :tags, :additional_properties

      # @param name [String]
      # @param tags [Array<String>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [User::User]
      def initialize(name:, tags:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [Array<String>]
        @tags = tags
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of User
      #
      # @param json_object [JSON]
      # @return [User::User]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        name = struct.name
        tags = struct.tags
        new(name: name, tags: tags, additional_properties: struct)
      end

      # Serialize an instance of User to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "tags": @tags }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.tags.is_a?(Array) != false || raise("Passed value for field obj.tags is not the expected type, validation failed.")
      end
    end
  end
end
