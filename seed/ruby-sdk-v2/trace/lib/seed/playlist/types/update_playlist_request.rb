# frozen_string_literal: true

module Seed
  module Playlist
    module Types
      class UpdatePlaylistRequest < Internal::Types::Model
        field :service_param, -> { Integer }, optional: false, nullable: false, api_name: "serviceParam"
        field :playlist_id, -> { String }, optional: false, nullable: false, api_name: "playlistId"
        field :name, -> { String }, optional: false, nullable: false
        field :problems, -> { Internal::Types::Array[String] }, optional: false, nullable: false
      end
    end
  end
end
