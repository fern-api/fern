package com.seed.api.resources.inline.types;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * lorem ipsum
 */
public final class RootType1 {

    /**
     * lorem ipsum
     */
    private final String foo;

    /**
     * lorem ipsum
     */
    private final RootType1.Bar bar;

    /**
     * lorem ipsum
     */
    private final Map<String, RootType1.FooMap.Value> fooMap;

    /**
     * lorem ipsum
     */
    private final List<FooList.Item> fooList;

    /**
     * lorem ipsum
     */
    private final Set<FooSet.Item> fooSet;

    /**
     * lorem ipsum
     */
    private final ReferenceType ref;

    public RootType1(
            String foo,
            RootType1.Bar bar,
            Map<String, RootType1.FooMap.Value> fooMap,
            List<FooList.Item> fooList,
            Set<FooSet.Item> fooSet,
            ReferenceType ref) {
        this.foo = foo;
        this.bar = bar;
        this.fooMap = fooMap;
        this.fooList = fooList;
        this.fooSet = fooSet;
        this.ref = ref;
    }

    public class Builder {
        private RootType1.Bar bar;

        private Map<String, RootType1.FooMap.Value> fooMap = new HashMap<>();

        private List<FooList.Item> fooList = new ArrayList<>();

        private Set<FooSet.Item> fooSet = new HashSet<>();

        private Builder() {}

        public RootType1.Builder bar(RootType1.Bar bar) {
            this.bar = bar;
            return this;
        }

        public RootType1.Builder putFooMap(String key, RootType1.FooMap.Value value) {
            this.fooMap.put(key, value);
            return this;
        }

        public RootType1.Builder putAllFooMap(Map<String, RootType1.FooMap.Value> entries) {
            for (Map.Entry<String, RootType1.FooMap.Value> entry : entries.entrySet()) {
                putFooMap(entry.getKey(), entry.getValue());
            }
            return this;
        }

        public RootType1.Builder addFooList(FooList.Item item) {
            this.fooList.add(item);
            return this;
        }

        public RootType1.Builder addAllFooList(Iterable<FooList.Item> items) {
            for (FooList.Item item : items) {
                addFooList(item);
            }
            return this;
        }

        public RootType1.Builder addFooSet(FooSet.Item item) {
            this.fooSet.add(item);
            return this;
        }

        public RootType1.Builder addAllFooSet(Iterable<FooSet.Item> items) {
            for (FooSet.Item item : items) {
                addFooSet(item);
            }
            return this;
        }
    }

    /**
     * lorem ipsum
     */
    public class Bar {
        /**
         * lorem ipsum
         */
        private final String foo;

        /**
         * lorem ipsum
         */
        private final Bar.Bar_ bar;

        /**
         * lorem ipsum
         */
        private final ReferenceType ref;

        public Bar(String foo, Bar.Bar_ bar, ReferenceType ref) {
            this.foo = foo;
            this.bar = bar;
            this.ref = ref;
        }

        public Bar.Builder builder() {
            return new Bar.Builder();
        }

        public class Builder {
            private String foo;

            private Bar.Bar_ bar;

            private ReferenceType ref;

            private Builder() {}

            public Bar.Builder foo(String foo) {
                this.foo = foo;
                return this;
            }

            public Bar.Builder bar(Bar.Bar_ bar) {
                this.bar = bar;
                return this;
            }

            public Bar.Builder ref(ReferenceType ref) {
                this.ref = ref;
                return this;
            }

            public Bar build() {
                return new Bar(foo, bar, ref);
            }
        }

        /**
         * lorem ipsum
         */
        public class Bar_ {
            /**
             * lorem ipsum
             */
            private final String foo;

            /**
             * lorem ipsum
             */
            private final String bar;

            /**
             * lorem ipsum
             */
            private final RootType1.MyEnum myEnum;

            /**
             * lorem ipsum
             */
            private final ReferenceType ref;

            public Bar_(String foo, String bar, RootType1.MyEnum myEnum, ReferenceType ref) {
                this.foo = foo;
                this.bar = bar;
                this.myEnum = myEnum;
                this.ref = ref;
            }

            public String getFoo() {
                return this.foo;
            }

            public String getBar() {
                return this.bar;
            }

            public RootType1.MyEnum getMyEnum() {
                return this.myEnum;
            }

            public ReferenceType getRef() {
                return this.ref;
            }

            public Bar_.Builder builder() {
                return new Bar_.Builder();
            }

            public class Builder {
                private String foo;

                private String bar;

                private RootType1.MyEnum myEnum;

                private ReferenceType ref;

                private Builder() {}

                public Bar_.Builder foo(String foo) {
                    this.foo = foo;
                    return this;
                }

                public Bar_.Builder bar(String bar) {
                    this.bar = bar;
                    return this;
                }

                public Bar_.Builder myEnum(RootType1.MyEnum myEnum) {
                    this.myEnum = myEnum;
                    return this;
                }

                public Bar_.Builder ref(ReferenceType ref) {
                    this.ref = ref;
                    return this;
                }

                public Bar_ build() {
                    return new Bar_(foo, bar, myEnum, ref);
                }
            }
        }
    }

    public enum MyEnum {
        SUNNY("Sunny"),
        CLOUDY("Cloudy"),
        RAINING("Raining"),
        SNOWING("Snowing"),
        ;

        private final String value;

        MyEnum(String value) {
            this.value = value;
        }

        public String toString() {
            return this.value;
        }
    }

    public class FooMap {
        public class Value {
            /**
             * lorem ipsum
             */
            private final String foo;

            /**
             * lorem ipsum
             */
            private final ReferenceType ref;

            public Value(String foo, ReferenceType ref) {
                this.foo = foo;
                this.ref = ref;
            }

            public String getFoo() {
                return this.foo;
            }

            public ReferenceType getRef() {
                return this.ref;
            }

            public FooMap.Value.Builder builder() {
                return new FooMap.Value.Builder();
            }

            public class Builder {
                private String foo;

                private ReferenceType ref;

                public Builder() {}

                public FooMap.Value.Builder foo(String foo) {
                    this.foo = foo;
                    return this;
                }

                public FooMap.Value.Builder ref(ReferenceType ref) {
                    this.ref = ref;
                    return this;
                }

                public FooMap.Value build() {
                    return new FooMap.Value(foo, ref);
                }
            }
        }
    }

    public class FooList {
        public class Item {
            /**
             * lorem ipsum
             */
            private final String foo;

            /**
             * lorem ipsum
             */
            private final ReferenceType ref;

            public Item(String foo, ReferenceType ref) {
                this.foo = foo;
                this.ref = ref;
            }

            public String getFoo() {
                return this.foo;
            }

            public ReferenceType getRef() {
                return this.ref;
            }

            public FooList.Item.Builder builder() {
                return new FooList.Item.Builder();
            }

            public class Builder {
                private String foo;

                private ReferenceType ref;

                public Builder() {}

                public FooList.Item.Builder foo(String foo) {
                    this.foo = foo;
                    return this;
                }

                public FooList.Item.Builder ref(ReferenceType ref) {
                    this.ref = ref;
                    return this;
                }

                public FooList.Item build() {
                    return new FooList.Item(foo, ref);
                }
            }
        }
    }

    public class FooSet {
        public class Item {
            /**
             * lorem ipsum
             */
            private final String foo;

            /**
             * lorem ipsum
             */
            private final ReferenceType ref;

            public Item(String foo, ReferenceType ref) {
                this.foo = foo;
                this.ref = ref;
            }

            public String getFoo() {
                return this.foo;
            }

            public ReferenceType getRef() {
                return this.ref;
            }

            public FooSet.Item.Builder builder() {
                return new FooSet.Item.Builder();
            }

            public class Builder {
                private String foo;

                private ReferenceType ref;

                public Builder() {}

                public FooSet.Item.Builder foo(String foo) {
                    this.foo = foo;
                    return this;
                }

                public FooSet.Item.Builder ref(ReferenceType ref) {
                    this.ref = ref;
                    return this;
                }

                public FooSet.Item build() {
                    return new FooSet.Item(foo, ref);
                }
            }
        }
    }
}
