# frozen_string_literal: true

module FernMixedFileDirectory
  module User
    module Events
      module Types
        class ListUserEventsRequest < Internal::Types::Model
          field :limit, -> { Integer }, optional: true, nullable: false
        end
      end
    end
  end
end
