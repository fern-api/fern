
module Seed
    module Types
        class TestCaseImplementation < Internal::Types::Model
            field :description, , optional: false, nullable: false
            field :function, , optional: false, nullable: false
        end
    end
end
