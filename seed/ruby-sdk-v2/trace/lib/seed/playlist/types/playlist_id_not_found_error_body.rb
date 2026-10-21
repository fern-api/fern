# frozen_string_literal: true

require_relative "../.."

module Seed
  module Playlist
    module Types
      class PlaylistIDNotFoundErrorBody < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "PLAYLIST_ID"
      end
    end
  end
end
