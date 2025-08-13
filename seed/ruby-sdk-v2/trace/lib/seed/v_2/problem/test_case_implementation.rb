
module Seed
    module Types
        class TestCaseImplementation < Internal::Types::Model
            field :description, Seed::v_2::problem::TestCaseImplementationDescription, optional: false, nullable: false
            field :function, Seed::v_2::problem::TestCaseFunction, optional: false, nullable: false
        end
    end
end
