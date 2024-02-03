configPath=$1

cd /model-generator/model-generator-"$VERSION"
java -cp model-generator-"$VERSION".jar:lib/* \
  com.fern.java.model.ModelGeneratorCli "$configPath"
