
module Seed
    module Types
        class TestCaseTemplate < Internal::Types::Model
            field :template_id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :implementation, , optional: false, nullable: false
        end
    end
end
