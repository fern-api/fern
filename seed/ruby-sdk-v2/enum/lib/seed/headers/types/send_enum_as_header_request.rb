
module Seed
    module Headers
        class SendEnumAsHeaderRequest
            field :operand, Seed::Operand, optional: false, nullable: false
            field :maybe_operand, Seed::Operand, optional: true, nullable: false
            field :operand_or_color, Seed::ColorOrOperand, optional: false, nullable: false
            field :maybe_operand_or_color, Seed::ColorOrOperand, optional: true, nullable: false
        end
    end
end
