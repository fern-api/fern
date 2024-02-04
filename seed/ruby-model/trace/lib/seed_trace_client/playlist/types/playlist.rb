# frozen_string_literal: true

require_relative "../../commons/types/user_id"

require_relative "../../commons/types/problem_id"
require_relative "playlist_id"
require "json"

module SeedTraceClient
  module Playlist
    class Playlist
      attr_reader :playlist_id, :owner_id, :name, :problems, :additional_properties

      # @param playlist_id [Playlist::PLAYLIST_ID]
      # @param owner_id [Commons::USER_ID]
      # @param name [String]
      # @param problems [Array<Commons::PROBLEM_ID>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Playlist::Playlist]
      def initialize(playlist_id:, owner_id:, name:, problems:, additional_properties: nil)
        # @type [Playlist::PLAYLIST_ID]
        @playlist_id = playlist_id
        # @type [Commons::USER_ID]
        @owner_id = owner_id
        # @type [String]
        @name = name
        # @type [Array<Commons::PROBLEM_ID>]
        @problems = problems
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Playlist
      #
      # @param json_object [JSON]
      # @return [Playlist::Playlist]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        playlist_id = struct.playlist_id
        owner_id = struct.owner - id
        name = struct.name
        problems = struct.problems
        new(playlist_id: playlist_id, owner_id: owner_id, name: name, problems: problems, additional_properties: struct)
      end

      # Serialize an instance of Playlist to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "playlist_id": @playlist_id, "owner-id": @owner_id, "name": @name, "problems": @problems }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.playlist_id.is_a?(String) != false || raise("Passed value for field obj.playlist_id is not the expected type, validation failed.")
        obj.owner_id.is_a?(String) != false || raise("Passed value for field obj.owner_id is not the expected type, validation failed.")
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.problems.is_a?(Array) != false || raise("Passed value for field obj.problems is not the expected type, validation failed.")
      end
    end
  end
end
