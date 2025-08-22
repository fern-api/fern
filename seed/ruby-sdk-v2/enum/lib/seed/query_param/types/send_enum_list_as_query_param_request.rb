# frozen_string_literal: true

module Seed
  module QueryParam
    module Types
      class SendEnumListAsQueryParamRequest < Internal::Types::Model
        field :operand, -> { Seed::Types::Operand }, optional: false, nullable: false
        field :maybe_operand, -> { Seed::Types::Operand }, optional: true, nullable: false
        field :operand_or_color, -> { Seed::Types::ColorOrOperand }, optional: false, nullable: false
        field :maybe_operand_or_color, -> { Seed::Types::ColorOrOperand }, optional: true, nullable: false
      end
    end
  end
end
