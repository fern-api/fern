
module Seed
    module Types
        class Memo < Internal::Types::Model
            field :description, , optional: false, nullable: false
            field :account, , optional: true, nullable: false
        end
    end
end
