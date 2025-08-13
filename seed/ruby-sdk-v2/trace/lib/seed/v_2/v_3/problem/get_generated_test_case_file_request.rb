
module Seed
    module Types
        class GetGeneratedTestCaseFileRequest < Internal::Types::Model
            field :template, Seed::v_2::v_3::problem::TestCaseTemplate, optional: true, nullable: false
            field :test_case, Seed::v_2::v_3::problem::TestCaseV2, optional: false, nullable: false

    end
end
