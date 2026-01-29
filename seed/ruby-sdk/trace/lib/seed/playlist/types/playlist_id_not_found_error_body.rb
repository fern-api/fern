# frozen_string_literal: true

module Seed
  module Playlist
    module Types
      class PlaylistIdNotFoundErrorBody < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "PLAYLIST_ID"
      end
    end
  end
end
