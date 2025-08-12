
module Seed
    module Types
        class TraceResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :line_number, Integer, optional: false, nullable: false
            field :return_value, Seed::commons::DebugVariableValue, optional: true, nullable: false
            field :expression_location, Seed::submission::ExpressionLocation, optional: true, nullable: false
            field :stack, Seed::submission::StackInformation, optional: false, nullable: false
            field :stdout, String, optional: true, nullable: false
        end
    end
end
