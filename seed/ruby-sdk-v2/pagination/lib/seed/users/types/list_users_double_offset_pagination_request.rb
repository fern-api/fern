
module Seed
    module Users
        class ListUsersDoubleOffsetPaginationRequest
            field :page, , optional: true, nullable: false
            field :per_page, , optional: true, nullable: false
            field :order, , optional: true, nullable: false
            field :starting_after, , optional: true, nullable: false
        end
    end
end
