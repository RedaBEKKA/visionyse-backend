import moongoose from "mongoose"

const connectDB = async (uri: any) => {
  try {
    await moongoose.connect(uri)
  } catch (error) {
    console.log("Error while connecting to the database ")
    throw error
  }
}
export default connectDB
