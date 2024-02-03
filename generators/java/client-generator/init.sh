configPath=$1

cd /client-generator/client-generator-"$VERSION"
java -cp client-generator-"$VERSION".jar:lib/* \
  com.fern.java.client.ClientGeneratorCli "$configPath"
