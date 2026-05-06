import mongoose from 'mongoose'


export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://qodeya:<db_password>@cluster0.1ukukar.mongodb.net/?appName=Cluster0/merndb')
        console.log(">>>>> DB is connected")
    } catch (error) {
        console.log(error);
    }
};
