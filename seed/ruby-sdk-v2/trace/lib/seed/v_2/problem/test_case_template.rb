
module Seed
    module Types
        class TestCaseTemplate < Internal::Types::Model
            field :template_id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
            field :implementation, Seed::v_2::problem::TestCaseImplementation, optional: false, nullable: false

    end
end
