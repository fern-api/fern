
module Seed
    module Types
        class Page < Internal::Types::Model
            field :page, , optional: false, nullable: false
            field :next_, , optional: true, nullable: false
            field :per_page, , optional: false, nullable: false
            field :total_page, , optional: false, nullable: false
        end
    end
end
