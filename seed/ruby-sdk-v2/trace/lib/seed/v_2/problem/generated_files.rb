
module Seed
    module Types
        class GeneratedFiles < Internal::Types::Model
            field :generated_test_case_files, Internal::Types::Hash[Seed::commons::Language, Seed::v_2::problem::Files], optional: false, nullable: false
            field :generated_template_files, Internal::Types::Hash[Seed::commons::Language, Seed::v_2::problem::Files], optional: false, nullable: false
            field :other, Internal::Types::Hash[Seed::commons::Language, Seed::v_2::problem::Files], optional: false, nullable: false

    end
end
