# frozen_string_literal: true

module FernEnum
  module Types
    class ColorOrOperand < Internal::Types::Model
      extend FernEnum::Internal::Types::Union

      member -> { FernEnum::Types::Color }
      member -> { FernEnum::Types::Operand }
    end
  end
end
