
module Seed
    module Types
        class TestCaseMetadata < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :hidden, , optional: false, nullable: false
        end
    end
end
