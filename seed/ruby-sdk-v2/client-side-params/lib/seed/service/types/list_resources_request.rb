
module Seed
    module Service
        class ListResourcesRequest
            field :page, Integer, optional: false, nullable: false
            field :per_page, Integer, optional: false, nullable: false
            field :sort, String, optional: false, nullable: false
            field :order, String, optional: false, nullable: false
            field :include_totals, Internal::Types::Boolean, optional: false, nullable: false
            field :fields, String, optional: true, nullable: false
            field :search, String, optional: true, nullable: false

    end
end
