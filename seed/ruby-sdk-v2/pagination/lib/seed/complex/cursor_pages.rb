
module Seed
    module Types
        class CursorPages < Internal::Types::Model
            field :next_, , optional: true, nullable: false
            field :page, , optional: true, nullable: false
            field :per_page, , optional: true, nullable: false
            field :total_pages, , optional: true, nullable: false
            field :type, , optional: false, nullable: false
        end
    end
end
