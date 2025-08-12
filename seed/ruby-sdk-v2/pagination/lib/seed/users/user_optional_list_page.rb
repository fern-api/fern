
module Seed
    module Types
        class UserOptionalListPage < Internal::Types::Model
            field :data, , optional: false, nullable: false
            field :next_, , optional: true, nullable: false
        end
    end
end
