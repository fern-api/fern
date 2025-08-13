
module Seed
    module Users
        class ListUsersOffsetPaginationRequest
            field :page, Integer, optional: true, nullable: false
            field :per_page, Integer, optional: true, nullable: false
            field :order, Seed::users::Order, optional: true, nullable: false
            field :starting_after, String, optional: true, nullable: false

    end
end
