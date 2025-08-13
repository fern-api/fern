
module Seed
    module Types
        class Moment < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :date, String, optional: false, nullable: false
            field :datetime, String, optional: false, nullable: false

    end
end
