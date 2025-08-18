# frozen_string_literal: true

module Seed
    module Types
        class PlaylistIdNotFoundErrorBody < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "PLAYLIST_ID"
    end
end
