configPath=$1

cd /model
java -cp model.jar:lib/* com.fern.java.model.ModelGeneratorCli "$configPath"
