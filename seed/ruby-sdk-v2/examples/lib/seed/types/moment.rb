
module Seed
    module Types
        class Moment < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :date, , optional: false, nullable: false
            field :datetime, , optional: false, nullable: false
        end
    end
end
