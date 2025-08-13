
module Seed
    module Types
        class TestCaseImplementationDescription < Internal::Types::Model
            field :boards, Internal::Types::Array[Seed::v_2::problem::TestCaseImplementationDescriptionBoard], optional: false, nullable: false

    end
end
