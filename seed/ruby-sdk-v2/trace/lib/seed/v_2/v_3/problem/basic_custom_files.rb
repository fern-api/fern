
module Seed
    module Types
        class BasicCustomFiles < Internal::Types::Model
            field :method_name, String, optional: false, nullable: false
            field :signature, Seed::v_2::v_3::problem::NonVoidFunctionSignature, optional: false, nullable: false
            field :additional_files, Internal::Types::Hash[Seed::commons::Language, Seed::v_2::v_3::problem::Files], optional: false, nullable: false
            field :basic_test_case_template, Seed::v_2::v_3::problem::BasicTestCaseTemplate, optional: false, nullable: false

    end
end
