# frozen_string_literal: true

module Playlist
    module Types
        class UpdatePlaylistRequest < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :problems, Array, optional: true, nullable: true
        end
    end
end
