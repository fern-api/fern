# frozen_string_literal: true

module SeedClient
  module Playlist
    class Playlist < PlaylistCreateRequest
      attr_reader :playlist_id, :owner_id, :additional_properties
      # @param playlist_id [Playlist::PlaylistId] 
      # @param owner_id [Commons::UserId] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Playlist::Playlist] 
      def initialze(playlist_id:, owner_id:, additional_properties: nil)
        # @type [Playlist::PlaylistId] 
        @playlist_id = playlist_id
        # @type [Commons::UserId] 
        @owner_id = owner_id
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Playlist
      #
      # @param json_object [JSON] 
      # @return [Playlist::Playlist] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        playlist_id = Playlist::PlaylistId.from_json(json_object: struct.playlist_id)
        owner_id = Commons::UserId.from_json(json_object: struct.owner-id)
        new(playlist_id: playlist_id, owner_id: owner_id, additional_properties: struct)
      end
      # Serialize an instance of Playlist to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 playlist_id: @playlist_id,
 owner-id: @owner_id
}.to_json()
      end
    end
  end
end