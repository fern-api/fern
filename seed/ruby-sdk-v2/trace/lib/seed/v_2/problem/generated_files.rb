
module Seed
    module Types
        class GeneratedFiles < Internal::Types::Model
            field :generated_test_case_files, , optional: false, nullable: false
            field :generated_template_files, , optional: false, nullable: false
            field :other, , optional: false, nullable: false
        end
    end
end
