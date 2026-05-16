// import app from './app.js'
// import { connectDB } from './db.js'

// connectDB();
// app.listen(3000)
// console.log('Server on port', 3000)

import app from './app.js';
import { connectDB } from './db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("DB conectada");

    app.listen(PORT, () => {
      console.log(`Server on port ${PORT}`);
    });

  } catch (error) {
    console.error("Error conectando a DB:", error);
  }
};

startServer();