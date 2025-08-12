
module Seed
    module Types
        class Migration < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :status, , optional: false, nullable: false
        end
    end
end
