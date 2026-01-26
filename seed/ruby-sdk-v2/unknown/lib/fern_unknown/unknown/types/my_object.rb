# frozen_string_literal: true

module FernUnknown
  module Unknown
    module Types
      class MyObject < Internal::Types::Model
        field :unknown, -> { Object }, optional: false, nullable: false
      end
    end
  end
end
