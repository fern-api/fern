
module Seed
    module Types
        class CursorPages < Internal::Types::Model
            field :next_, Seed::complex::StartingAfterPaging, optional: true, nullable: false
            field :page, Integer, optional: true, nullable: false
            field :per_page, Integer, optional: true, nullable: false
            field :total_pages, Integer, optional: true, nullable: false
            field :type, String, optional: false, nullable: false

    end
end
