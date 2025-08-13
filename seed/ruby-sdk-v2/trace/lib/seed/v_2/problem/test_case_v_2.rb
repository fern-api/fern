
module Seed
    module Types
        class TestCaseV2 < Internal::Types::Model
            field :metadata, Seed::v_2::problem::TestCaseMetadata, optional: false, nullable: false
            field :implementation, Seed::v_2::problem::TestCaseImplementationReference, optional: false, nullable: false
            field :arguments, Internal::Types::Hash[String, Seed::commons::VariableValue], optional: false, nullable: false
            field :expects, Seed::v_2::problem::TestCaseExpects, optional: true, nullable: false
        end
    end
end
