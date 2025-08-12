
module Seed
    module Types
        class ListUsersPaginationResponse < Internal::Types::Model
            field :has_next_page, , optional: true, nullable: false
            field :page, , optional: true, nullable: false
            field :total_count, , optional: false, nullable: false
            field :data, , optional: false, nullable: false
        end
    end
end
