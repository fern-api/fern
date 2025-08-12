
module Seed
    module Types
        class BasicTestCaseTemplate < Internal::Types::Model
            field :template_id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
            field :description, Seed::v_2::problem::TestCaseImplementationDescription, optional: false, nullable: false
            field :expected_value_parameter_id, String, optional: false, nullable: false
        end
    end
end
