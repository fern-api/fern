# frozen_string_literal: true
require "json"
require "playlist/types/PlaylistId"

module SeedClient
  module Playlist
    class PlaylistIdNotFoundErrorBody
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Playlist::PlaylistIdNotFoundErrorBody] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of PlaylistIdNotFoundErrorBody
      #
      # @param json_object [JSON] 
      # @return [Playlist::PlaylistIdNotFoundErrorBody] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "playlist_id"
          member = Playlist::PlaylistId.from_json(json_object: json_object.value)
        else
          member = Playlist::PlaylistId.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "playlist_id"
          { type: @discriminant, value: @member }.to_json()
        else
          { type: @discriminant, value: @member }.to_json()
        end
        @member.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        case obj.type
        when "playlist_id"
          PlaylistId.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end
      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object] 
      # @return [] 
      def is_a(obj)
        @member.is_a?(obj)
      end
      # @param member [Playlist::PlaylistId] 
      # @return [Playlist::PlaylistIdNotFoundErrorBody] 
      def self.playlist_id(member:)
        new(member: member, discriminant: "playlist_id")
      end
    end
  end
end