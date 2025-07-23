# frozen_string_literal: true

module Types
    module Types
        class ObjectWithOptionalField < Internal::Types::Model
            field :string, Array, optional: true, nullable: true
            field :integer, Array, optional: true, nullable: true
            field :long, Array, optional: true, nullable: true
            field :double, Array, optional: true, nullable: true
            field :bool, Array, optional: true, nullable: true
            field :datetime, Array, optional: true, nullable: true
            field :date, Array, optional: true, nullable: true
            field :uuid, Array, optional: true, nullable: true
            field :base_64, Array, optional: true, nullable: true
            field :list, Array, optional: true, nullable: true
            field :set, Array, optional: true, nullable: true
            field :map, Array, optional: true, nullable: true
            field :bigint, Array, optional: true, nullable: true
        end
    end
end
