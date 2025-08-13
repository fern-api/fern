
module Seed
    module Users
        class ListUsersOffsetStepPaginationRequest
            field :page, Integer, optional: true, nullable: false
            field :limit, Integer, optional: true, nullable: false
            field :order, Seed::Users::Order, optional: true, nullable: false

    end
end
