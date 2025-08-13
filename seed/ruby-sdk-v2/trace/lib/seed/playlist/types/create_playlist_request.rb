
module Seed
    module Playlist
        class CreatePlaylistRequest
            field :service_param, Integer, optional: false, nullable: false
            field :datetime, String, optional: false, nullable: false
            field :optional_datetime, String, optional: true, nullable: false
    end
end
