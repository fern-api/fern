# frozen_string_literal: true

module FernPagination
  module Complex
    module Types
      class Conversation < Internal::Types::Model
        field :foo, -> { String }, optional: false, nullable: false
      end
    end
  end
end
