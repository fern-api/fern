# frozen_string_literal: true

module Seed
  module Playlist
    module Types
      class PlaylistGetPlaylistRequest < Internal::Types::Model
        field :service_param, -> { Integer }, optional: false, nullable: false, api_name: "serviceParam"
        field :playlist_id, -> { String }, optional: false, nullable: false, api_name: "playlistId"
      end
    end
  end
end
