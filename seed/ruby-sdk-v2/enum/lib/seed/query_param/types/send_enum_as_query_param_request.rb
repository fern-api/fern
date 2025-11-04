# frozen_string_literal: true

module Seed
  module QueryParam
    module Types
      class SendEnumAsQueryParamRequest < Internal::Types::Model
        field :operand, -> { Seed::Types::Operand }, optional: false, nullable: false
        field :maybe_operand, -> { Seed::Types::Operand }, optional: true, nullable: false, api_name: "maybeOperand"
        field :operand_or_color, lambda {
          Seed::Types::ColorOrOperand
        }, optional: false, nullable: false, api_name: "operandOrColor"
        field :maybe_operand_or_color, lambda {
          Seed::Types::ColorOrOperand
        }, optional: true, nullable: false, api_name: "maybeOperandOrColor"
      end
    end
  end
end
