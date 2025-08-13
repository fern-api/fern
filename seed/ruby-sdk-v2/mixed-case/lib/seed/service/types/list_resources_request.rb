
module Seed
    module Service
        class ListResourcesRequest
            field :page_limit, Integer, optional: false, nullable: false
            field :before_date, String, optional: false, nullable: false

    end
end
