
module Seed
    module Types
        class BasicTestCaseTemplate < Internal::Types::Model
            field :template_id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :description, , optional: false, nullable: false
            field :expected_value_parameter_id, , optional: false, nullable: false
        end
    end
end
