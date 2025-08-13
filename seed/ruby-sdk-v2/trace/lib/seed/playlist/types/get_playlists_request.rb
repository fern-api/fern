
module Seed
    module Playlist
        class GetPlaylistsRequest
            field :service_param, Integer, optional: false, nullable: false
            field :limit, Integer, optional: true, nullable: false
            field :other_field, String, optional: false, nullable: false
            field :multi_line_docs, String, optional: false, nullable: false
            field :optional_multiple_field, String, optional: true, nullable: false
            field :multiple_field, String, optional: false, nullable: false

    end
end
