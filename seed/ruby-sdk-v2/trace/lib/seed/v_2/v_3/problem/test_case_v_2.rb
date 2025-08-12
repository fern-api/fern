
module Seed
    module Types
        class TestCaseV2 < Internal::Types::Model
            field :metadata, , optional: false, nullable: false
            field :implementation, , optional: false, nullable: false
            field :arguments, , optional: false, nullable: false
            field :expects, , optional: true, nullable: false
        end
    end
end
