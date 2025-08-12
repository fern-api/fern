
module Seed
    module Playlist
        class GetPlaylistsRequest
            field :service_param, , optional: false, nullable: false
            field :limit, , optional: true, nullable: false
            field :other_field, , optional: false, nullable: false
            field :multi_line_docs, , optional: false, nullable: false
            field :optional_multiple_field, , optional: true, nullable: false
            field :multiple_field, , optional: false, nullable: false
        end
    end
end
