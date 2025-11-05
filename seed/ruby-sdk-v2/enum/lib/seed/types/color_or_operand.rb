# frozen_string_literal: true

module Seed
  module Types
    class ColorOrOperand < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::Color }
      member -> { Seed::Types::Operand }
    end
  end
end
