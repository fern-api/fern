# frozen_string_literal: true

module Nullable
    module Types
        class Metadata < Internal::Types::Model
            field :created_at, DateTime, optional: true, nullable: true
            field :updated_at, DateTime, optional: true, nullable: true
            field :avatar, Array, optional: true, nullable: true
            field :activated, Array, optional: true, nullable: true
            field :status, Status, optional: true, nullable: true
            field :values, Array, optional: true, nullable: true
        end
    end
end
