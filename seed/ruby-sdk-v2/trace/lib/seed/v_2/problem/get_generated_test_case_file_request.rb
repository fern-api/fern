
module Seed
    module Types
        class GetGeneratedTestCaseFileRequest < Internal::Types::Model
            field :template, , optional: true, nullable: false
            field :test_case, , optional: false, nullable: false
        end
    end
end
