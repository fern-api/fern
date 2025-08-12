
module Seed
    module Types
        class Metadata < Internal::Types::Model
            field :created_at, , optional: false, nullable: false
            field :updated_at, , optional: false, nullable: false
            field :avatar, , optional: false, nullable: true
            field :activated, , optional: true, nullable: false
            field :status, , optional: false, nullable: false
            field :values, , optional: true, nullable: false
        end
    end
end
