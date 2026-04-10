# frozen_string_literal: true

module Seed
  module Playlist
    module Types
      class PlaylistCreatePlaylistRequest < Internal::Types::Model
        field :service_param, -> { Integer }, optional: false, nullable: false, api_name: "serviceParam"
        field :datetime, -> { String }, optional: false, nullable: false
        field :optional_datetime, -> { String }, optional: true, nullable: false, api_name: "optionalDatetime"
        field :body, -> { Seed::Types::PlaylistCreateRequest }, optional: false, nullable: false
      end
    end
  end
end
