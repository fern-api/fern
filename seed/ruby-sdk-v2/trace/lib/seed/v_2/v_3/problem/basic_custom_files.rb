
module Seed
    module Types
        class BasicCustomFiles < Internal::Types::Model
            field :method_name, , optional: false, nullable: false
            field :signature, , optional: false, nullable: false
            field :additional_files, , optional: false, nullable: false
            field :basic_test_case_template, , optional: false, nullable: false
        end
    end
end
