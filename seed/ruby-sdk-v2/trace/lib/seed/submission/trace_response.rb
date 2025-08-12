
module Seed
    module Types
        class TraceResponse < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :line_number, , optional: false, nullable: false
            field :return_value, , optional: true, nullable: false
            field :expression_location, , optional: true, nullable: false
            field :stack, , optional: false, nullable: false
            field :stdout, , optional: true, nullable: false
        end
    end
end
