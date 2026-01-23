# frozen_string_literal: true

module FernTrace
  module Playlist
    module Types
      class PlaylistIdNotFoundErrorBody < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "PLAYLIST_ID"
      end
    end
  end
end
