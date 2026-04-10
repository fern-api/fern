# frozen_string_literal: true

module Seed
  module Pathparam
    module Types
      class PathParamSendRequest < Internal::Types::Model
        field :operand, -> { Seed::Types::Operand }, optional: false, nullable: false
        field :operand_or_color, -> { Seed::Types::ColorOrOperand }, optional: false, nullable: false, api_name: "operandOrColor"
      end
    end
  end
end
