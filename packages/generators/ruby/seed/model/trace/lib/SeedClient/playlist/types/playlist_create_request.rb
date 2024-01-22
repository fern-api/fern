# frozen_string_literal: true

require_relative "commons/types/PROBLEM_ID"
require "json"

module SeedClient
  module Playlist
    class PlaylistCreateRequest
      attr_reader :name, :problems, :additional_properties

      # @param name [String]
      # @param problems [Array<Commons::PROBLEM_ID>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Playlist::PlaylistCreateRequest]
      def initialze(name:, problems:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [Array<Commons::PROBLEM_ID>]
        @problems = problems
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of PlaylistCreateRequest
      #
      # @param json_object [JSON]
      # @return [Playlist::PlaylistCreateRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        problems = struct.problems
        new(name: name, problems: problems, additional_properties: struct)
      end

      # Serialize an instance of PlaylistCreateRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { name: @name, problems: @problems }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
