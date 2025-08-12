
module Seed
    module QueryParam
        class SendEnumAsQueryParamRequest
            field :operand, , optional: false, nullable: false
            field :maybe_operand, , optional: true, nullable: false
            field :operand_or_color, , optional: false, nullable: false
            field :maybe_operand_or_color, , optional: true, nullable: false
        end
    end
end
