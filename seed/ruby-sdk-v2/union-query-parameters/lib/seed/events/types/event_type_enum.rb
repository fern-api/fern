# frozen_string_literal: true

module Seed
  module Events
    module Types
      module EventTypeEnum
        extend Seed::Internal::Types::Enum

        GROUP_CREATED = "group.created"
        USER_UPDATED = "user.updated"
      end
    end
  end
end
