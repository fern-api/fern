
module Seed
    module Types
        class ListUsersPaginationResponse < Internal::Types::Model
            field :has_next_page, Internal::Types::Boolean, optional: true, nullable: false
            field :page, Seed::users::Page, optional: true, nullable: false
            field :total_count, Integer, optional: false, nullable: false
            field :data, Internal::Types::Array[Seed::users::User], optional: false, nullable: false

    end
end
