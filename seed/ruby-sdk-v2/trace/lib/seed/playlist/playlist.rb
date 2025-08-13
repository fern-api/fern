
module Seed
    module Types
        class Playlist < Internal::Types::Model
            field :playlist_id, String, optional: false, nullable: false
            field :owner_id, String, optional: false, nullable: false
        end
    end
end
