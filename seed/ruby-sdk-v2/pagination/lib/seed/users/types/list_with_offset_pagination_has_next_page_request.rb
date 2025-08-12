
module Seed
    module Users
        class ListWithOffsetPaginationHasNextPageRequest
            field :page, , optional: true, nullable: false
            field :limit, , optional: true, nullable: false
            field :order, , optional: true, nullable: false
        end
    end
end
