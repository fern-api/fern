# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Playlist
    class UpdatePlaylistRequest
      # @return [String]
      attr_reader :name
      # @return [Array<String>] The problems that make up the playlist.
      attr_reader :problems
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param problems [Array<String>] The problems that make up the playlist.
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Playlist::UpdatePlaylistRequest]
      def initialize(name:, problems:, additional_properties: nil)
        @name = name
        @problems = problems
        @additional_properties = additional_properties
        @_field_set = { "name": name, "problems": problems }
      end

      # Deserialize a JSON object to an instance of UpdatePlaylistRequest
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Playlist::UpdatePlaylistRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        problems = parsed_json["problems"]
        new(
          name: name,
          problems: problems,
          additional_properties: struct
        )
      end

      # Serialize an instance of UpdatePlaylistRequest to a JSON object
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
        obj.problems.is_a?(Array) != false || raise("Passed value for field obj.problems is not the expected type, validation failed.")
      end
    end
  end
end
