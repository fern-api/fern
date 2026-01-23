# frozen_string_literal: true

module FernEnum
  module QueryParam
    module Types
      class SendEnumListAsQueryParamRequest < Internal::Types::Model
        field :operand, -> { FernEnum::Types::Operand }, optional: false, nullable: false
        field :maybe_operand, -> { FernEnum::Types::Operand }, optional: true, nullable: false, api_name: "maybeOperand"
        field :operand_or_color, -> { FernEnum::Types::ColorOrOperand }, optional: false, nullable: false, api_name: "operandOrColor"
        field :maybe_operand_or_color, -> { FernEnum::Types::ColorOrOperand }, optional: true, nullable: false, api_name: "maybeOperandOrColor"
      end
    end
  end
end
