// import mongoose from 'mongoose';

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log(">>>>> DB is connected");
//   } catch (error) {
//     console.log(error);
//   }
// };

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://qodeya:5ynQ4W0Z8h@cluster0.1ukukar.mongodb.net/merndb?retryWrites=true&w=majority'
    );
    console.log(">>>>> DB is connected");
  } catch (error) {
    console.log(error);
  }
};