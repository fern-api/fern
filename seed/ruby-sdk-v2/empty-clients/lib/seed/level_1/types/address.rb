
module Seed
    module Types
        class Address < Internal::Types::Model
            field :line_1, , optional: false, nullable: false
            field :line_2, , optional: true, nullable: false
            field :city, , optional: false, nullable: false
            field :state, , optional: false, nullable: false
            field :zip, , optional: false, nullable: false
            field :country, , optional: false, nullable: false
        end
    end
end
