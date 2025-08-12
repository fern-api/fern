
module Seed
    module Types
        class Account < Internal::Types::Model
            field :resource_type, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :patient, , optional: true, nullable: false
            field :practitioner, , optional: true, nullable: false
        end
    end
end
