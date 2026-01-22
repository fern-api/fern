# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListWithGlobalConfigRequest < Internal::Types::Model
        field :offset, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
