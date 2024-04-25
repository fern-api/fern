# frozen_string_literal: true

require "json"

module SeedTraceClient
  class Playlist
    class PlaylistIdNotFoundErrorBody
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Playlist::PlaylistIdNotFoundErrorBody]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of PlaylistIdNotFoundErrorBody
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Playlist::PlaylistIdNotFoundErrorBody]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "playlistId"
                   json_object.value
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "playlistId"
        end
        { "type": @discriminant, "value": @member }.to_json
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "playlistId"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [String]
      # @return [SeedTraceClient::Playlist::PlaylistIdNotFoundErrorBody]
      def self.playlist_id(member:)
        new(member: member, discriminant: "playlistId")
      end
    end
  end
end
