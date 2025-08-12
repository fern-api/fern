
module Seed
    module Types
        class Playlist < Internal::Types::Model
            field :playlist_id, , optional: false, nullable: false
            field :owner_id, , optional: false, nullable: false
        end
    end
end
