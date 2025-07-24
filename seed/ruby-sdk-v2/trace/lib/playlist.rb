# frozen_string_literal: true

module Playlist
    module Types
        class Playlist < Internal::Types::Model
            field :playlist_id, PlaylistId, optional: true, nullable: true
            field :owner_id, UserId, optional: true, nullable: true
        end
    end
end
